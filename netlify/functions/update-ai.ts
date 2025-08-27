import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  const url = process.env.N8N_URL_UPDATE_AI
  const token = process.env.N8N_TOKEN
  if (!url || !token) {
    return { statusCode: 500, body: 'Missing N8N configuration' }
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: event.body || '{}'
    })

    const text = await res.text()
    return {
      statusCode: res.status,
      headers: {
        'Content-Type': res.headers.get('content-type') || 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      },
      body: text
    }
  } catch (e) {
    return { statusCode: 502, body: 'Upstream error' }
  }
}

export default {}

