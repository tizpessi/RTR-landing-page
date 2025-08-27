import type { Handler } from '@netlify/functions'

// Protects /admin with a Basic-like password from env and serves admin-dashboard.html
export const handler: Handler = async (event) => {
  try {
    // Only allow GET
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, headers: { Allow: 'GET' }, body: 'Method Not Allowed' }
    }

    const password = process.env.ADMIN_PASSWORD
    if (!password) {
      return { statusCode: 500, body: 'Admin not configured' }
    }

    const auth = event.headers.authorization || ''

    // Expect header: Authorization: Basic base64(:password)
    // We accept password-only for simplicity: username blank
    const expected = 'Basic ' + Buffer.from(':' + password).toString('base64')
    const ok = auth === expected

    if (!ok) {
      return {
        statusCode: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Restricted Area"',
          'Cache-Control': 'no-store'
        },
        body: 'Authentication required'
      }
    }

    // Serve your provided admin app from /admin-app/index.html
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      },
      body: ADMIN_APP_HTML
    }
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

export default {}

