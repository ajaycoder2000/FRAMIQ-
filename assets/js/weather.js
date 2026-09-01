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
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max` +
    `&forecast_days=15&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Forecast request failed');
  return res.json();
}

function farmiqBuildDays(data) {
  const d = data.daily;
  return d.time.map((date, i) => ({
    date,
    tMax: Math.round(d.temperature_2m_max[i]),
    tMin: Math.round(d.temperature_2m_min[i]),
    rain: d.precipitation_sum[i],
    rainProb: d.precipitation_probability_max[i],
    wind: Math.round(d.windspeed_10m_max[i]),
  }));
}

/* Crop-specific advisory rule engine — meaningfully differentiated per crop */
function farmiqAdvisory(crop, days) {
  const today = days[0];
  const next7 = days.slice(0, 7);
  const totalRain7 = next7.reduce((s, d) => s + d.rain, 0);
  const heatDays = next7.filter(d => d.tMax >= 32).length;
  const dryDays = next7.filter(d => d.rainProb < 20).length;
  const windyDays = next7.filter(d => d.wind >= 35).length;

  const notes = [];

  switch (crop) {
    case 'corn':
      if (heatDays >= 3) notes.push(`Sustained heat above ${farmiqTemp(32)}${farmiqTempUnit()} over the next week can stress pollination — consider irrigation timing around silking if in that stage.`);
      if (totalRain7 < 15) notes.push('Low rainfall expected this week; monitor soil moisture closely during vegetative growth.');
      if (windyDays >= 2) notes.push('High wind days forecast — delay foliar fertilizer or pesticide application to avoid drift.');
      if (notes.length === 0) notes.push('Conditions look stable for corn this week — good window for routine field work.');
      break;
    case 'soybeans':
      if (today.rainProb > 60) notes.push('High rain probability today — hold off on any planned herbicide or fungicide spraying.');
      if (dryDays >= 5) notes.push('Extended dry stretch ahead; watch for pod-fill stress if plants are flowering.');
      if (heatDays >= 2) notes.push('A few hot days forecast — heat during flowering can reduce pod set, irrigate if possible.');
      if (notes.length === 0) notes.push('Balanced moisture and temperature expected — favorable week for soybean development.');
      break;
    case 'wheat':
      if (totalRain7 > 40) notes.push('Significant rain expected — if approaching harvest, this raises lodging and grain-quality risk; consider adjusting harvest timing.');
      if (dryDays >= 6 && heatDays >= 3) notes.push('Hot, dry stretch forecast — good conditions for harvest if grain moisture is on target; verify before combining.');
      if (windyDays >= 3) notes.push('Frequent high winds forecast — increased lodging risk in mature stands.');
      if (notes.length === 0) notes.push('Stable week ahead — good visibility for planning harvest logistics.');
      break;
    case 'vegetables':
      if (today.rainProb > 50) notes.push('Rain likely today — delay transplanting and avoid working wet soil to prevent compaction.');
      if (heatDays >= 3) notes.push('Multiple hot days ahead — increase irrigation frequency for shallow-rooted vegetable crops.');
      if (windyDays >= 2) notes.push('Windy conditions forecast — protect young transplants and secure row covers.');
      if (notes.length === 0) notes.push('Mild, steady conditions this week — good window for succession planting.');
      break;
    case 'grapes':
      if (heatDays >= 3) notes.push('Heat stress risk is elevated for the canopy this week — prioritize irrigation and consider afternoon canopy shading.');
      if (totalRain7 > 25) notes.push('Wet week ahead — increased disease pressure (mildew/botrytis); consider a preventive fungicide pass and improve canopy airflow.');
      if (dryDays >= 6) notes.push('Extended dry period — deficit irrigation can be fine pre-veraison, but monitor vine stress closely.');
      if (windyDays >= 2) notes.push('Windy days forecast — good for canopy drying and reduced disease pressure.');
      if (notes.length === 0) notes.push('Favorable ripening conditions this week — low disease and heat stress risk.');
      break;
    default:
      notes.push('Select a crop to see tailored advisory.');
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
