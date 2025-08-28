import type { Handler } from '@netlify/functions'

// Cookie name for admin session
const SESSION_COOKIE = 'adminSession'

export const handler: Handler = async (event) => {
  try {
    const password = process.env.ADMIN_PASSWORD
    if (!password) {
      return { statusCode: 500, body: 'Admin not configured' }
    }

    // Validate existing session cookie on any method
    const cookies = parseCookies(event.headers.cookie || '')
    const hasValidSession = cookies[SESSION_COOKIE] === makeSessionToken(password)

    // Handle POST (login submission)
    if (event.httpMethod === 'POST') {
      const contentType = (event.headers['content-type'] || '').toLowerCase()
      let form: Record<string, string> = {}
      if (contentType.includes('application/x-www-form-urlencoded')) {
        form = parseFormUrlEncoded(event.body || '')
      } else if (contentType.includes('application/json')) {
        try { form = JSON.parse(event.body || '{}') } catch {}
      }
      const submitted = (form.password || '').toString()
      if (submitted === password) {
        // Set HttpOnly session cookie, redirect to /admin (GET)
        return {
          statusCode: 302,
          headers: {
            Location: '/admin',
            'Set-Cookie': buildCookieHeader(SESSION_COOKIE, makeSessionToken(password)),
          },
          body: ''
        }
      }
      // Invalid password → show login with error
      return html(200, renderLogin(true))
    }

    // For GET: if valid session, serve app, else show login form
    if (event.httpMethod === 'GET') {
      if (hasValidSession) {
        return html(200, ADMIN_APP_HTML)
      }
      return html(200, renderLogin(false))
    }

    return { statusCode: 405, headers: { Allow: 'GET, POST' }, body: 'Method Not Allowed' }
  } catch (e) {
    return { statusCode: 500, body: 'Internal Error' }
  }
}

// Inline your admin app HTML (loads /admin-app/styles.css and /admin-app/app.js)
const ADMIN_APP_HTML = `<!DOCTYPE html>
${'<' }html lang="en">${'<' }head>${'<' }meta charset="UTF-8">${'<' }meta name="viewport" content="width=device-width, initial-scale=1.0">${'<' }title>RTR Text Visualizer${'<' }/title>${'<' }link rel="stylesheet" href="/admin-app/styles.css">${'<' }/head>${'<' }body>
${'<' }div id="homepage" class="view active">${'<' }div class="header">${'<' }h1>Conversations${'<' }/h1>${'<' }button id="refreshHome" class="btn btn-primary">Refresh${'<' }/button>${'<' }/div>${'<' }div id="conversationList" class="conversation-list"></div>${'<' }/div>
${'<' }div id="conversationView" class="view">${'<' }div class="header">${'<' }button id="backButton" class="btn btn-secondary">← Back${'<' }/button>${'<' }h2 id="conversationTitle"></h2>${'<' }button id="refreshConversation" class="btn btn-primary">Refresh${'<' }/button>${'<' }label class="ai-checkbox">${'<' }input type="checkbox" id="aiReplying" checked>${'<' }span>AI replying${'<' }/span>${'<' }/label>${'<' }/div>${'<' }div id="messagesContainer" class="messages-container"></div>${'<' }div class="message-input-container">${'<' }input type="text" id="messageInput" placeholder="Type your message..." />${'<' }button id="sendButton" class="btn btn-send">Send${'<' }/button>${'<' }/div>${'<' }/div>
${'<' }script src="/admin-app/app.js"></script>${'<' }/body>${'<' }/html>`

function renderLogin(invalid: boolean): string {
  const err = invalid ? `${'<' }p style="color:#c00;margin:0 0 12px 0;">Incorrect password</p>` : ''
  return `<!DOCTYPE html>
${'<' }html lang="en">${'<' }head>${'<' }meta charset="UTF-8">${'<' }meta name="viewport" content="width=device-width, initial-scale=1.0">${'<' }title>Admin Login${'<' }/title>${'<' }style>
body{margin:0;background:linear-gradient(135deg,#667eea,#764ba2);font-family:Inter,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
.wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.card{background:#fff;border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,.12);padding:28px;max-width:360px;width:100%}
.card h1{margin:0 0 8px 0;font-size:20px;color:#2c3e50}
.card p{margin:0 0 16px 0;color:#555}
label{display:block;margin:0 0 8px 0;color:#2c3e50;font-weight:600;font-size:14px}
input[type=password]{width:100%;padding:12px 14px;border:2px solid #e1e8ed;border-radius:8px;font-size:14px;outline:none}
input[type=password]:focus{border-color:#667eea}
button{width:100%;margin-top:14px;background:#667eea;color:#fff;border:0;padding:12px 16px;border-radius:8px;font-weight:600;cursor:pointer}
button:hover{background:#5a6fd8}
${'<' }/style>${'<' }/head>${'<' }body>${'<' }div class="wrap">${'<' }div class="card">${'<' }h1>Admin Access${'<' }/h1>${'<' }p>Enter password to continue${'<' }/p>${err}
${'<' }form method="POST" action="/admin" enctype="application/x-www-form-urlencoded">${'<' }label for="pw">Password${'<' }/label>${'<' }input id="pw" name="password" type="password" autofocus placeholder="••••••••" />${'<' }button type="submit">Continue${'<' }/button>${'<' }/form>
${'<' }/div>${'<' }/div>${'<' }/body>${'<' }/html>`
}

function html(status: number, body: string) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body
  }
}

function parseCookies(header: string): Record<string,string> {
  const out: Record<string,string> = {}
  header.split(/;\s*/).forEach(p => {
    const i = p.indexOf('=')
    if (i > 0) out[p.slice(0,i)] = decodeURIComponent(p.slice(i+1))
  })
  return out
}

function parseFormUrlEncoded(body: string): Record<string,string> {
  const out: Record<string,string> = {}
  body.split('&').forEach(pair => {
    if (!pair) return
    const [k, v] = pair.split('=')
    out[decodeURIComponent(k)] = decodeURIComponent(v || '')
  })
  return out
}

function makeSessionToken(password: string): string {
  // Simple deterministic token derived from password; for production, prefer HMAC with a separate secret
  return Buffer.from('ok:' + password).toString('base64')
}

function buildCookieHeader(name: string, value: string): string {
  // Cookie scoped to /admin only
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/admin',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Max-Age=86400'
  ]
  return attrs.join('; ')
}

export default {}

