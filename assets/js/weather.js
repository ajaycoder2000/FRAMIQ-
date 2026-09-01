/* FarmIQ Weather & Advisory — Open-Meteo integration + crop advisory rule engine */


const FARMIQ_LOCATION_KEY = 'farmiq_location';

/* --- Units -------------------------------------------------------------
   Forecast data arrives from Open-Meteo in metric and all advisory
   thresholds are evaluated in metric. Units affect display only, so the
   rule engine stays consistent regardless of what the farmer reads. */

const FARMIQ_UNITS_KEY = 'farmiq_units';

function farmiqDefaultUnits() {
  // US growers think in °F/inches/mph. Prefer the saved field location,
  // then the browser locale, before falling back to metric.
  try {
    const loc = JSON.parse(localStorage.getItem(FARMIQ_LOCATION_KEY) || 'null');
    if (loc && typeof loc.lat === 'number' && typeof loc.lon === 'number') {
      const inUS = loc.lat > 24 && loc.lat < 50 && loc.lon > -125 && loc.lon < -66;
      return inUS ? 'imperial' : 'metric';
    }
  } catch (e) { /* fall through to locale */ }

  const lang = (navigator.language || '').toLowerCase();
  return (lang === 'en-us' || lang === 'en-um') ? 'imperial' : 'metric';
}

function farmiqGetUnits() {
  return localStorage.getItem(FARMIQ_UNITS_KEY) || farmiqDefaultUnits();
}

function farmiqSetUnits(units) {
  localStorage.setItem(FARMIQ_UNITS_KEY, units);
}

function farmiqIsImperial() {
  return farmiqGetUnits() === 'imperial';
}

/* Display converters — input is always metric. */
function farmiqTemp(celsius) {
  return farmiqIsImperial() ? Math.round(celsius * 9 / 5 + 32) : Math.round(celsius);
}
function farmiqTempUnit() { return farmiqIsImperial() ? '°F' : '°C'; }

function farmiqRain(mm) {
  return farmiqIsImperial() ? (mm / 25.4).toFixed(2) : mm;
}
function farmiqRainUnit() { return farmiqIsImperial() ? 'in' : 'mm'; }

function farmiqWind(kmh) {
  return farmiqIsImperial() ? Math.round(kmh / 1.609) : Math.round(kmh);
}
function farmiqWindUnit() { return farmiqIsImperial() ? 'mph' : 'km/h'; }

const FARMIQ_CROPS = {
  corn: { label: 'Corn', icon: '🌽' },
  soybeans: { label: 'Soybeans', icon: '🫘' },
  wheat: { label: 'Wheat', icon: '🌾' },
  vegetables: { label: 'Vegetables', icon: '🥦' },
  grapes: { label: 'Grapes', icon: '🍇' },
};

async function farmiqFetchForecast(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,et0_fao_evapotranspiration` +
    `&hourly=soil_temperature_6cm,soil_moisture_3_to_9cm,vapour_pressure_deficit` +
    `&forecast_days=15&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Forecast request failed');
  return res.json();
}

/* Reduce an hourly series to one value per calendar day. Soil/VPD readings
   are noisy hour to hour, so a daily mean is the honest summary — a single
   3pm reading would overstate heat, a single 3am reading would understate it. */
function farmiqDailyMeanFromHourly(hourlyTime, hourlyValues, dailyDates) {
  const byDay = {};
  hourlyTime.forEach((ts, i) => {
    const day = ts.slice(0, 10);
    const v = hourlyValues[i];
    if (v === null || v === undefined) return;
    (byDay[day] = byDay[day] || []).push(v);
  });
  return dailyDates.map((date) => {
    const vals = byDay[date];
    if (!vals || !vals.length) return null;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  });
}

function farmiqBuildDays(data) {
  const d = data.daily;
  const h = data.hourly || {};
  const soilTempByDay = h.time && h.soil_temperature_6cm
    ? farmiqDailyMeanFromHourly(h.time, h.soil_temperature_6cm, d.time) : [];
  const soilMoistureByDay = h.time && h.soil_moisture_3_to_9cm
    ? farmiqDailyMeanFromHourly(h.time, h.soil_moisture_3_to_9cm, d.time) : [];
  const vpdByDay = h.time && h.vapour_pressure_deficit
    ? farmiqDailyMeanFromHourly(h.time, h.vapour_pressure_deficit, d.time) : [];

  return d.time.map((date, i) => ({
    date,
    tMax: Math.round(d.temperature_2m_max[i]),
    tMin: Math.round(d.temperature_2m_min[i]),
    rain: d.precipitation_sum[i],
    rainProb: d.precipitation_probability_max[i],
    wind: Math.round(d.windspeed_10m_max[i]),
    et0: d.et0_fao_evapotranspiration ? Math.round(d.et0_fao_evapotranspiration[i] * 10) / 10 : null,
    soilTemp: soilTempByDay[i] != null ? Math.round(soilTempByDay[i] * 10) / 10 : null,
    // Open-Meteo reports volumetric soil moisture as m³/m³ (0-1); show as %.
    soilMoisture: soilMoistureByDay[i] != null ? Math.round(soilMoistureByDay[i] * 1000) / 10 : null,
    vpd: vpdByDay[i] != null ? Math.round(vpdByDay[i] * 10) / 10 : null,
  }));
}

/* Growing degree days for the crops we support, base temperature in °C
   (the temperature below which a crop doesn't meaningfully develop).
   Standard agronomic values — corn/soy/veg/grapes at 10°C, wheat at 4°C
   since it's a cool-season crop that develops well below that threshold. */
const FARMIQ_GDD_BASE = {
  corn: 10, soybeans: 10, wheat: 4, vegetables: 10, grapes: 10,
};

/* Cumulative GDD across the given days — a forward projection over the
   forecast window, not season-to-date (we don't know the planting date). */
function farmiqProjectedGDD(crop, days) {
  const base = FARMIQ_GDD_BASE[crop] ?? 10;
  let total = 0;
  return days.map((d) => {
    const mean = (d.tMax + d.tMin) / 2;
    total += Math.max(0, mean - base);
    return Math.round(total);
  });
}

/* Crop-specific advisory rule engine — meaningfully differentiated per crop */
/* Soil temperature a seed needs before it will germinate reliably.
   Below this, planting risks poor emergence and seedling disease even if
   air temperature looks fine. Perennial crops (grapes) have no entry —
   established vines aren't planting-limited by soil temp. */
const FARMIQ_PLANTING_SOIL_TEMP = { corn: 10, soybeans: 13, wheat: 4, vegetables: 13 };

function farmiqWaterBalanceNote(next7, cropWord) {
  const totalRain7 = next7.reduce((s, d) => s + d.rain, 0);
  const et0Days = next7.filter(d => d.et0 != null);
  if (et0Days.length < 5) {
    // Not enough ET0 coverage (older cached data, or the API omitted it) —
    // fall back to the cruder rain-only read rather than say nothing.
    if (totalRain7 < 15) return `Low rainfall expected this week (${Math.round(totalRain7)}mm) — monitor soil moisture closely for ${cropWord}.`;
    return null;
  }
  const totalET0_7 = et0Days.reduce((s, d) => s + d.et0, 0);
  const deficit = Math.round(totalET0_7 - totalRain7);
  if (deficit > 12) {
    return `Net water deficit this week: about ${deficit}mm more evaporating (${Math.round(totalET0_7)}mm ET₀) than falling as rain (${Math.round(totalRain7)}mm) — irrigation is likely needed for ${cropWord}.`;
  }
  if (deficit < -15) {
    return `Rainfall is expected to exceed crop water use by about ${Math.abs(deficit)}mm this week — irrigation almost certainly isn't needed, and check drainage on heavier ground.`;
  }
  return null;
}

function farmiqPlantingSoilNote(crop, today) {
  const threshold = FARMIQ_PLANTING_SOIL_TEMP[crop];
  if (threshold == null || today.soilTemp == null) return null;
  const st = today.soilTemp;
  if (st < threshold) {
    return `Soil temperature is around ${farmiqTemp(st)}${farmiqTempUnit()} at 6cm depth — below the ~${farmiqTemp(threshold)}${farmiqTempUnit()} most growers target for reliable germination. If you haven't planted yet, it's worth waiting for soil to warm.`;
  }
  if (st - threshold < 2) {
    return `Soil temperature is around ${farmiqTemp(st)}${farmiqTempUnit()} at 6cm depth — just above the germination threshold. Marginal for planting; a cold snap could still slow emergence.`;
  }
  return null;
}

function farmiqVpdNote(next7) {
  const vpdDays = next7.filter(d => d.vpd != null);
  if (vpdDays.length < 5) return null;
  const avgVpd = vpdDays.reduce((s, d) => s + d.vpd, 0) / vpdDays.length;
  if (avgVpd < 0.6) {
    return 'Low vapour pressure deficit this week — humid, slow-drying air that favours fungal disease. Consider a preventive spray if pressure is already present, and prioritize canopy airflow.';
  }
  if (avgVpd > 1.8) {
    return 'High vapour pressure deficit this week — the air is pulling moisture out of the crop and any spray fast, which raises drift and evaporation risk. Favour early-morning or evening spray windows.';
  }
  return null;
}

function farmiqAdvisory(crop, days) {
  const today = days[0];
  const next7 = days.slice(0, 7);
  const totalRain7 = next7.reduce((s, d) => s + d.rain, 0);
  const heatDays = next7.filter(d => d.tMax >= 32).length;
  const dryDays = next7.filter(d => d.rainProb < 20).length;
  const windyDays = next7.filter(d => d.wind >= 35).length;

  const notes = [];
  const cropWords = { corn: 'corn', soybeans: 'soybeans', wheat: 'wheat', vegetables: 'vegetable crops', grapes: 'the vineyard' };

  const soilNote = farmiqPlantingSoilNote(crop, today);
  if (soilNote) notes.push(soilNote);

  switch (crop) {
    case 'corn':
      if (heatDays >= 3) notes.push(`Sustained heat above ${farmiqTemp(32)}${farmiqTempUnit()} over the next week can stress pollination — consider irrigation timing around silking if in that stage.`);
      if (windyDays >= 2) notes.push('High wind days forecast — delay foliar fertilizer or pesticide application to avoid drift.');
      break;
    case 'soybeans':
      if (today.rainProb > 60) notes.push('High rain probability today — hold off on any planned herbicide or fungicide spraying.');
      if (dryDays >= 5) notes.push('Extended dry stretch ahead; watch for pod-fill stress if plants are flowering.');
      if (heatDays >= 2) notes.push('A few hot days forecast — heat during flowering can reduce pod set, irrigate if possible.');
      break;
    case 'wheat':
      if (totalRain7 > 40) notes.push('Significant rain expected — if approaching harvest, this raises lodging and grain-quality risk; consider adjusting harvest timing.');
      if (dryDays >= 6 && heatDays >= 3) notes.push('Hot, dry stretch forecast — good conditions for harvest if grain moisture is on target; verify before combining.');
      if (windyDays >= 3) notes.push('Frequent high winds forecast — increased lodging risk in mature stands.');
      break;
    case 'vegetables':
      if (today.rainProb > 50) notes.push('Rain likely today — delay transplanting and avoid working wet soil to prevent compaction.');
      if (windyDays >= 2) notes.push('Windy conditions forecast — protect young transplants and secure row covers.');
      break;
    case 'grapes':
      if (heatDays >= 3) notes.push('Heat stress risk is elevated for the canopy this week — prioritize irrigation and consider afternoon canopy shading.');
      if (windyDays >= 2) notes.push('Windy days forecast — good for canopy drying and reduced disease pressure.');
      break;
    default:
      notes.push('Select a crop to see tailored advisory.');
      return notes;
  }

  const waterNote = farmiqWaterBalanceNote(next7, cropWords[crop] || 'the crop');
  if (waterNote) notes.push(waterNote);

  const vpdNote = farmiqVpdNote(next7);
  if (vpdNote) notes.push(vpdNote);

  if (notes.length === 0) {
    notes.push(`Conditions look stable for ${cropWords[crop] || 'this crop'} this week — good window for routine field work.`);
  }

  return notes;
}

function farmiqRiskScore(days) {
  const next7 = days.slice(0, 7);
  const heat = next7.filter(d => d.tMax >= 32).length;
  const wet = next7.filter(d => d.rain > 15).length;
  const wind = next7.filter(d => d.wind >= 35).length;
  const raw = heat * 12 + wet * 8 + wind * 6;
  return Math.max(4, Math.min(96, raw));
}


function farmiqSaveLocation(lat, lon, label) {
  localStorage.setItem(FARMIQ_LOCATION_KEY, JSON.stringify({ lat, lon, label }));
}
function farmiqGetLocation() {
  try { return JSON.parse(localStorage.getItem(FARMIQ_LOCATION_KEY) || 'null'); } catch (e) { return null; }
}
