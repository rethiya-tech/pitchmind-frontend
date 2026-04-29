import http from 'node:http'
import type { IncomingMessage, ServerResponse } from 'node:http'

const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiZXhwIjo5OTk5OTk5OTk5fQ.mock_sig'
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi00NTYiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiZXhwIjo5OTk5OTk5OTk5fQ.mock_sig'

const USER = { id: 'user-123', email: 'test@example.com', name: 'Test User', role: 'user', is_active: true }
const ADMIN = { id: 'admin-456', email: 'admin@example.com', name: 'Admin User', role: 'admin', is_active: true }

const MOCK_SLIDES = [
  { id: 'slide-1', conversion_id: 'fake-conversion-id', position: 0, layout: 'title_bullets', title: 'Introduction', bullets: ['Key point one', 'Key point two'], speaker_notes: '', is_deleted: false },
  { id: 'slide-2', conversion_id: 'fake-conversion-id', position: 1, layout: 'title_bullets', title: 'Main Content', bullets: ['Detail here', 'Another detail'], speaker_notes: '', is_deleted: false },
  { id: 'slide-3', conversion_id: 'fake-conversion-id', position: 2, layout: 'title_bullets', title: 'Conclusion', bullets: ['Summary point'], speaker_notes: '', is_deleted: false },
]

const MOCK_CONVERSION = {
  id: 'fake-conversion-id',
  user_id: 'user-123',
  upload_id: 'upload-1',
  original_filename: 'test-document.pdf',
  status: 'done',
  style: 'professional',
  slide_count: 3,
  theme: 'executive_gold',
  audience_level: 'general',
  tokens_used: 1000,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  slides: MOCK_SLIDES,
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => resolve(body))
  })
}

function parseCookies(req: IncomingMessage): Record<string, string> {
  const cookieHeader = req.headers.cookie ?? ''
  const cookies: Record<string, string> = {}
  cookieHeader.split(';').forEach((part) => {
    const [key, ...rest] = part.trim().split('=')
    if (key) cookies[key.trim()] = rest.join('=')
  })
  return cookies
}

const CORS = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
}

function json(res: ServerResponse, status: number, data: unknown, extraHeaders: Record<string, string> = {}) {
  const body = JSON.stringify(data)
  res.writeHead(status, { 'Content-Type': 'application/json', ...CORS, ...extraHeaders })
  res.end(body)
}

async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = req.url ?? ''
  const method = req.method ?? 'GET'

  if (method === 'OPTIONS') {
    res.writeHead(204, CORS)
    res.end()
    return
  }

  if (method === 'POST' && url === '/api/v1/auth/login') {
    const body = await readBody(req)
    const params = new URLSearchParams(body)
    const username = params.get('username') ?? ''
    const password = params.get('password') ?? ''

    if (username === 'admin@example.com' && password === 'adminpassword') {
      return json(res, 200, { access_token: ADMIN_TOKEN, token_type: 'bearer', user: ADMIN }, {
        'Set-Cookie': 'mock_refresh=admin; Path=/; SameSite=Lax',
      })
    }
    if (username === 'test@example.com' && password === 'testpassword') {
      return json(res, 200, { access_token: USER_TOKEN, token_type: 'bearer', user: USER }, {
        'Set-Cookie': 'mock_refresh=user; Path=/; SameSite=Lax',
      })
    }
    return json(res, 401, { detail: 'Invalid email or password' })
  }

  if (method === 'POST' && url === '/api/v1/auth/logout') {
    return json(res, 200, { message: 'ok' }, {
      'Set-Cookie': 'mock_refresh=; Path=/; Max-Age=0',
    })
  }

  if (method === 'POST' && url === '/api/v1/auth/refresh') {
    const cookies = parseCookies(req)
    const session = cookies['mock_refresh']
    if (session === 'admin') return json(res, 200, { access_token: ADMIN_TOKEN, token_type: 'bearer', user: ADMIN })
    if (session === 'user') return json(res, 200, { access_token: USER_TOKEN, token_type: 'bearer', user: USER })
    return json(res, 401, { detail: 'No valid session' })
  }

  if (method === 'GET' && url === '/api/v1/conversions') {
    return json(res, 200, { items: [MOCK_CONVERSION], total: 1 })
  }

  if (method === 'GET' && /^\/api\/v1\/conversions\/[^/]+$/.test(url)) {
    return json(res, 200, MOCK_CONVERSION)
  }

  if (method === 'POST' && url.includes('/export')) {
    return json(res, 200, { download_url: 'https://storage.googleapis.com/fake/presentation.pptx' })
  }

  if (method === 'POST' && url.includes('/cancel')) {
    return json(res, 200, { message: 'ok' })
  }

  if (method === 'POST' && /^\/api\/v1\/conversions\/[^/]+\/slides$/.test(url)) {
    const newSlide = { id: `slide-new-${Date.now()}`, conversion_id: 'fake-conversion-id', position: 3, layout: 'title_bullets', title: 'New Slide', bullets: [], speaker_notes: '', is_deleted: false }
    return json(res, 201, newSlide)
  }

  if (method === 'POST' && url === '/api/v1/conversions') {
    return json(res, 202, MOCK_CONVERSION)
  }

  if (method === 'PATCH' && url.startsWith('/api/v1/slides/')) {
    await new Promise<void>((resolve) => setTimeout(resolve, 150))
    return json(res, 200, MOCK_SLIDES[0])
  }

  if (method === 'DELETE' && url.startsWith('/api/v1/slides/')) {
    return json(res, 200, { message: 'ok' })
  }

  if (method === 'GET' && url === '/api/v1/admin/metrics') {
    return json(res, 200, { total_users: 42, total_conversions: 128, conversions_today: 7, failed_today: 1, ai_cost_today_usd: 0.0245 })
  }

  if (method === 'GET' && url.startsWith('/api/v1/admin/users')) {
    return json(res, 200, {
      items: [
        { id: 'user-123', email: 'test@example.com', name: 'Test User', role: 'user', is_active: true, created_at: new Date().toISOString(), conversion_count: 5 },
        { id: 'admin-456', email: 'admin@example.com', name: 'Admin User', role: 'admin', is_active: true, created_at: new Date().toISOString(), conversion_count: 2 },
      ],
      total: 52,
      page: 1,
    })
  }

  if (method === 'GET' && url.startsWith('/api/v1/admin/audit-log')) {
    return json(res, 200, {
      items: [
        { id: 'log-1', actor_email: 'admin@example.com', action: 'user.created', target_type: 'user', target_id: 'user-123', metadata: {}, created_at: new Date().toISOString() },
      ],
      total: 1,
      page: 1,
    })
  }

  if (method === 'POST' && url.startsWith('/api/v1/uploads')) {
    return json(res, 200, { upload_url: 'https://storage.googleapis.com/fake-upload', upload_id: 'upload-new', gcs_key: 'uploads/user-123/fake.pdf' })
  }

  if (url.includes('/stream')) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...CORS,
    })
    res.write('event: progress\ndata: {"completed":0,"total":3}\n\n')
    const closeTimer = setTimeout(() => {
      res.write('event: done\ndata: {}\n\n')
      res.end()
    }, 5000)
    res.on('close', () => clearTimeout(closeTimer))
    return
  }

  json(res, 404, { detail: 'Not found' })
}

export function createMockServer(port = 8000) {
  const server = http.createServer(handler)
  return new Promise<http.Server>((resolve, reject) => {
    server.on('error', reject)
    server.listen(port, () => resolve(server))
  })
}
