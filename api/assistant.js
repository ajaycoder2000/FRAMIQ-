/* FarmIQ Farm Assistant — Vercel serverless function.
 *
 * The Gemini API key lives here, server-side, read from the GEMINI_API_KEY
 * environment variable. It is never sent to the browser and never appears
 * in a response body — the frontend only ever sees the generated text.
 *
 * The browser posts { message, crop, location, days } and gets { reply }.
 * If anything fails (missing key, quota, timeout), this returns a non-200
 * and the frontend quietly falls back to its local rule engine, so the
 * assistant degrades instead of breaking.
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const CROP_LABELS = {
  corn: 'Corn', soybeans: 'Soybeans', wheat: 'Wheat',
  vegetables: 'Vegetables', grapes: 'Grapes',
};

const MAX_MESSAGE_CHARS = 1000;
const REQUEST_TIMEOUT_MS = 20000;

/* Compress the forecast into a few readable lines rather than raw JSON —
   cheaper in tokens and easier for the model to reason over. */
function summarizeForecast(days, imperial) {
  if (!Array.isArray(days) || days.length === 0) {
    return 'No forecast is loaded for this farmer yet.';
  }
  const t = (c) => (imperial ? Math.round(c * 9 / 5 + 32) : Math.round(c));
  const r = (mm) => (imperial ? (mm / 25.4).toFixed(2) : mm);
  const w = (kmh) => (imperial ? Math.round(kmh / 1.609) : Math.round(kmh));
  const tU = imperial ? '°F' : '°C';
  const rU = imperial ? 'in' : 'mm';
  const wU = imperial ? 'mph' : 'km/h';

  const lines = days.slice(0, 7).map((d) => {
    const date = String(d.date || '').slice(0, 10);
    return `${date}: high ${t(d.tMax)}${tU}, low ${t(d.tMin)}${tU}, rain ${r(d.rain)}${rU} (${d.rainProb}% chance), wind ${w(d.wind)} ${wU}`;
  });
  return lines.join('\n');
}

function buildSystemPrompt(crop, location, days, units) {
  const cropLabel = CROP_LABELS[crop] || 'an unspecified crop';
  const place = location && location.label ? location.label : 'an unspecified location';
  const imperial = units === 'imperial';

  return `You are FarmIQ's Farm Assistant, helping a working farmer make practical decisions.

THE FARMER'S CONTEXT
- Crop: ${cropLabel}
- Location: ${place}
- Preferred units: ${imperial ? 'imperial (°F, inches, mph)' : 'metric (°C, mm, km/h)'} — always answer in these units
- Next 7 days of forecast:
${summarizeForecast(days, imperial)}

HOW TO ANSWER
- Be concise and practical: 2-4 sentences for simple questions. This farmer is often reading on a phone, outdoors, mid-task.
- Ground your answer in the forecast above whenever the question touches weather, irrigation, spraying, disease pressure or harvest timing. Cite the actual numbers.
- Tailor advice to ${cropLabel} specifically. Growth-stage sensitivities differ sharply between crops — corn at silking, wheat near harvest, grapes near veraison.
- Plain language, no marketing tone, no bullet lists unless genuinely clearer.

IMPORTANT LIMITS
- If no forecast is loaded, say so and suggest enabling location on the Weather & Advisory page rather than inventing weather.
- You cannot see their field, soil tests, or crop history. For a diagnosis question (disease, pests, discoloration), give the most likely causes and what to check, and be clear it needs visual confirmation.
- Never invent specific pesticide or fertiliser rates, product names, or legal application windows — these vary by country and are regulated. Point them to their local extension service or the product label instead.
- If you are unsure, say so plainly. A farmer acting on a confident wrong answer can lose a crop.`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Not an error worth surfacing to the farmer — the client falls back.
    return res.status(503).json({ error: 'Assistant is not configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || typeof body.message !== 'string' || !body.message.trim()) {
    return res.status(400).json({ error: 'A message is required' });
  }

  const message = body.message.trim().slice(0, MAX_MESSAGE_CHARS);
  const systemPrompt = buildSystemPrompt(body.crop, body.location, body.days, body.units);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstream = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: {
          temperature: 0.4,       // advice should be steady, not creative
          maxOutputTokens: 600,
        },
      }),
    });

    if (!upstream.ok) {
      // Log server-side for debugging; never leak upstream detail (or the
      // key echoed in a URL) to the browser.
      const detail = await upstream.text().catch(() => '');
      console.error('Gemini request failed', upstream.status, detail.slice(0, 500));
      return res.status(502).json({ error: 'Assistant is unavailable right now' });
    }

    const data = await upstream.json();
    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text)
      .filter(Boolean)
      .join('')
      .trim();

    if (!reply) {
      return res.status(502).json({ error: 'Assistant returned no answer' });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    const reason = err.name === 'AbortError' ? 'timed out' : err.message;
    console.error('Assistant error:', reason);
    return res.status(502).json({ error: 'Assistant is unavailable right now' });
  } finally {
    clearTimeout(timeout);
  }
};
