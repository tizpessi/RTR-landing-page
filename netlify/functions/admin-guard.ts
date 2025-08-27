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

    // Serve admin-dashboard.html from root
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      },
      body: ADMIN_DASHBOARD_HTML
    }
  } catch (e) {
    return { statusCode: 500, body: 'Internal Error' }
  }
}

// Inline the dashboard HTML at build time to avoid fs reads in Edge/runtime
// Note: Keep this in sync with admin-dashboard.html if you customize further.
const ADMIN_DASHBOARD_HTML = `<!DOCTYPE html>
${'<' }html lang="en">${'<' }head>${'<' }meta charset="UTF-8">${'<' }meta name="viewport" content="width=device-width, initial-scale=1.0">${'<' }title>Admin Dashboard - Raise the Roof${'<' }/title>${'<' }link rel="stylesheet" href="/styles.css">${'<' }/head>${'<' }body>
${'<' }header class="header">${'<' }nav class="nav">${'<' }div class="nav-container">${'<' }div class="logo">${'<' }h1>Admin Dashboard${'<' }/h1>${'<' }span class="logo-subtitle">Raise the Roof${'<' }/span>${'<' }/div>${'<' }div class="nav-links">${'<' }a href="/">← Back to Site${'<' }/a>${'<' }/div>${'<' }/div>${'<' }/nav>${'<' }/header>
${'<' }main>${'<' }section class="admin-dashboard">${'<' }div class="container">${'<' }h1>Admin Dashboard${'<' }/h1>${'<' }p class="dashboard-subtitle">Welcome to your admin panel. Manage your Raise the Roof program from here.${'<' }/p>${'<' }div class="quick-stats">${'<' }h2>Quick Stats${'<' }/h2>${'<' }div class="stats-grid">${'<' }div class="stat-item">${'<' }div class="stat-number">24${'<' }/div>${'<' }div class="stat-label">Total Leads${'<' }/div>${'<' }/div>${'<' }div class="stat-item">${'<' }div class="stat-number">8${'<' }/div>${'<' }div class="stat-label">Completed Inspections${'<' }/div>${'<' }/div>${'<' }div class="stat-item">${'<' }div class="stat-number">$2,400${'<' }/div>${'<' }div class="stat-label">Total Donations${'<' }/div>${'<' }/div>${'<' }div class="stat-item">${'<' }div class="stat-number">3${'<' }/div>${'<' }div class="stat-label">Schools Participating${'<' }/div>${'<' }/div>${'<' }/div>${'<' }/div>${'<' }/section>${'<' }/main>
${'<' }footer class="footer">${'<' }div class="container">${'<' }p>&copy; 2024 Interstate Roofing - Admin Dashboard${'<' }/p>${'<' }/div>${'<' }/footer>
${'<' }/body>${'<' }/html>`

export default {}

