/* FarmIQ Farm Assistant — local rule-based MVP responses.
   getAssistantResponse() is the single isolated hook: swap its body later
   for a call to a real backend endpoint (never call an LLM API directly
   from the browser — no API keys in frontend code). */

async function getAssistantResponse(message, context) {
  // context: { crop, location, days } — provided by the caller from current app state.
  // MVP: pure local rule engine, no network call, no keys.
  return farmiqLocalAssistantRules(message, context);
}

function farmiqLocalAssistantRules(message, context) {
  const msg = (message || '').toLowerCase();
  const crop = context && context.crop;
  const cropLabel = crop && FARMIQ_CROPS[crop] ? FARMIQ_CROPS[crop].label : 'your crop';
  const days = (context && context.days) || [];
  const today = days[0];

  if (/rain|irrigat|water/.test(msg)) {
    if (today) {
      return today.rainProb > 50
        ? `Rain probability today is ${today.rainProb}% for your location — I'd hold off on irrigation and any spraying until it clears.`
        : `Rain probability today is only ${today.rainProb}%. For ${cropLabel}, that likely means irrigation is still worth considering this week — check the 15-day forecast for the driest stretch.`;
    }
    return `I don't have your current forecast loaded yet — enable location or select a manual location on the Weather & Advisory page so I can give a rain-specific answer.`;
  }

  if (/heat|hot|temperature|stress/.test(msg)) {
    if (crop === 'grapes') return `Grapes are heat-sensitive during ripening. If highs are forecast above 32°C for multiple days, prioritize irrigation and watch for sunburn on exposed clusters.`;
    if (crop === 'wheat') return `Wheat generally tolerates heat well once mature, but heat right before harvest can accelerate grain drying — good for combining, risky if you're not ready.`;
    if (crop === 'corn') return `Heat during corn's silking/pollination stage is the highest-risk window — irrigate if you can and avoid unnecessary field stress during that period.`;
    return `Heat stress impact depends on your crop's current growth stage. Select ${cropLabel === 'your crop' ? 'a crop' : cropLabel} on the Weather & Advisory page for a specific answer.`;
  }

  if (/harvest/.test(msg)) {
    if (crop === 'wheat') return `For wheat, target harvest during a dry stretch with low rain probability to protect grain quality and reduce lodging risk. Check the 15-day forecast for your driest window.`;
    if (crop === 'grapes') return `Grape harvest timing depends on brix/ripeness plus weather — avoid picking right after heavy rain, as it dilutes sugars and raises rot risk.`;
    return `Harvest timing for ${cropLabel} is best planned around a dry, low-wind stretch in your 15-day forecast — check the Weather & Advisory page.`;
  }

  if (/wind/.test(msg)) {
    return `High wind days are a good signal to delay spraying (drift risk) and, for tall or mature crops, watch for lodging.`;
  }

  if (/disease|mildew|fungic/.test(msg)) {
    if (crop === 'grapes') return `Grapes are prone to mildew and botrytis in wet, humid stretches. A preventive fungicide pass before a rainy week is common practice — check your 7-day rain total.`;
    return `Disease pressure usually rises after wet, humid stretches. Check your rain forecast on the Weather & Advisory page and consider a preventive treatment before extended wet periods.`;
  }

  if (/hello|hi|hey/.test(msg)) {
    return `Hey! I'm your Farm Assistant. Ask me about irrigation, heat stress, harvest timing, wind, or disease risk for ${cropLabel === 'your crop' ? 'your selected crop' : cropLabel}.`;
  }

  return `I can help with irrigation timing, heat stress, harvest windows, wind risk, and disease pressure for ${cropLabel === 'your crop' ? 'your crop' : cropLabel}. Try asking something like "should I irrigate this week?"`;
}
