import { describe, it, expect } from 'vitest'


describe('jwt utils', () => {
  it('decodeToken returns payload from valid JWT', async () => {
    const { decodeToken } = await import('@/utils/jwt')
    const payload = { user_id: 'u1', role: 'user', email: 'a@a.com', exp: 9999999999 }
    const encoded = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
                    btoa(JSON.stringify(payload)) + '.fake-sig'
    const result = decodeToken(encoded)
    expect(result?.user_id).toBe('u1')
  })

  it('decodeToken returns null for malformed token', async () => {
    const { decodeToken } = await import('@/utils/jwt')
    expect(decodeToken('not.a.token')).toBeNull()
  })

  it('decodeToken returns null for empty string', async () => {
    const { decodeToken } = await import('@/utils/jwt')
    expect(decodeToken('')).toBeNull()
  })

  it('isTokenExpired returns true for past exp', async () => {
    const { isTokenExpired } = await import('@/utils/jwt')
    const payload = { user_id: 'u1', role: 'user', email: 'a@a.com', exp: 1 }
    const encoded = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
                    btoa(JSON.stringify(payload)) + '.fake-sig'
    expect(isTokenExpired(encoded)).toBe(true)
  })

  it('isTokenExpired returns false for future exp', async () => {
    const { isTokenExpired } = await import('@/utils/jwt')
    const payload = { user_id: 'u1', role: 'user', email: 'a@a.com', exp: 9999999999 }
    const encoded = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
                    btoa(JSON.stringify(payload)) + '.fake-sig'
    expect(isTokenExpired(encoded)).toBe(false)
  })

  it('getUserFromToken extracts user fields', async () => {
    const { getUserFromToken } = await import('@/utils/jwt')
    const payload = { user_id: 'u1', role: 'admin', email: 'admin@a.com', exp: 9999999999 }
    const encoded = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
                    btoa(JSON.stringify(payload)) + '.fake-sig'
    const user = getUserFromToken(encoded)
    expect(user?.role).toBe('admin')
    expect(user?.email).toBe('admin@a.com')
  })
})
