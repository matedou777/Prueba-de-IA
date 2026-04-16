// api/generate.js — Vercel Serverless Function
// POST /api/generate
// Body: { prompt: string, count: number }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { prompt, count = 15 } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 2) {
    return res.status(400).json({ error: 'Falta el prompt' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'NO_API_KEY' });

  const safeCount = Math.min(Math.max(parseInt(count) || 15, 5), 50);

  const systemPrompt = `Sos un asistente para un juego de palabras llamado "El Impostor".
El usuario te va a describir una categoría con sus propias palabras.
Tu tarea es:
1. Inferir un nombre corto y claro para esa categoría (máximo 3 palabras)
2. Generar exactamente ${safeCount} palabras o frases cortas que pertenezcan a esa categoría
Las palabras deben ser conocidas por hispanohablantes, variadas, y útiles para el juego.
Respondé ÚNICAMENTE con un objeto JSON sin markdown ni explicaciones:
{"categoryName":"Nombre","words":["Palabra1","Palabra2",...]}`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nDescripción del usuario: ${prompt.trim()}` }],
            },
          ],
          generationConfig: { temperature: 0.8, maxOutputTokens: 600 },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_UNSPECIFIED',
              threshold: 'BLOCK_NONE',
            },
          ],
        }),
      }
    );

    if (!r.ok) {
      const errData = await r.json();
      console.error('Gemini error:', errData);
      return res.status(502).json({ error: `Error al contactar Gemini: ${errData?.error?.message || 'Desconocido'}` });
    }

    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!text) {
      return res.status(502).json({ error: 'Gemini no devolvió contenido' });
    }

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error('No JSON found in response:', text);
      return res.status(502).json({ error: 'Respuesta inesperada de Gemini' });
    }

    const parsed = JSON.parse(match[0]);
    return res.status(200).json({ categoryName: parsed.categoryName, words: parsed.words });
  } catch (e) {
    console.error('Exception:', e);
    return res.status(500).json({ error: `Error interno: ${e.message}` });
  }
}
}
