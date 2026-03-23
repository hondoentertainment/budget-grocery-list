/**
 * Vercel serverless proxy: set GEMINI_API_KEY in project env (not VITE_*).
 * Deploy with frontend VITE_GEMINI_PROXY_URL=/api/gemini (or full URL).
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const key = process.env.GEMINI_API_KEY
  if (!key) {
    res.status(503).json({ error: 'GEMINI_API_KEY is not configured' })
    return
  }

  try {
    const upstream = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' +
        encodeURIComponent(key),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      },
    )

    const data = await upstream.json()
    res.status(upstream.status).json(data)
  } catch {
    res.status(502).json({ error: 'Upstream request failed' })
  }
}
