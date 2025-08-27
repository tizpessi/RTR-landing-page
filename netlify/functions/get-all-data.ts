import type { Handler } from '@netlify/functions'

export const handler: Handler = async () => {
  const url = process.env.N8N_URL_GET_ALL
  const token = process.env.N8N_TOKEN
  if (!url || !token) {
    return { statusCode: 500, body: 'Missing N8N configuration' }
  }

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
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

