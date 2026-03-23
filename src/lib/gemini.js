const MODEL = 'gemini-1.5-flash'

function proxyUrl() {
  const p = import.meta.env.VITE_GEMINI_PROXY_URL
  if (!p) return null
  if (p.startsWith('http')) return p.replace(/\/$/, '')
  return `${typeof window !== 'undefined' ? window.location.origin : ''}${p.startsWith('/') ? p : `/${p}`}`
}

export async function geminiGenerateContent(body) {
  const proxy = proxyUrl()
  const key = import.meta.env.VITE_GEMINI_API_KEY || ''

  let res
  if (proxy) {
    res = await fetch(proxy, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } else if (key) {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )
  } else {
    throw new Error('NO_GEMINI')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText || 'Gemini request failed'
    throw new Error(msg)
  }
  return data
}

export function extractText(data) {
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}
