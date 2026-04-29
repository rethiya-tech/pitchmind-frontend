export interface JwtPayload {
  user_id: string
  email: string
  role: string
  exp: number
  [key: string]: unknown
}

function base64Decode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
  return atob(padded)
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    if (!token) return null
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const decoded = base64Decode(parts[1])
    return JSON.parse(decoded) as JwtPayload
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token)
  if (!payload) return true
  return payload.exp * 1000 < Date.now()
}

export function getUserFromToken(token: string): { id: string; email: string; role: string } | null {
  const payload = decodeToken(token)
  if (!payload) return null
  return {
    id: payload.user_id,
    email: payload.email,
    role: payload.role,
  }
}
