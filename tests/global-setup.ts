import { createMockServer } from './mock-server'
import type http from 'node:http'

let server: http.Server

export default async function globalSetup() {
  server = await createMockServer(8000)
  ;(globalThis as Record<string, unknown>).__mockServer__ = server
}
