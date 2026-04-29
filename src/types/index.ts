export interface User {
  id: string
  email: string
  name: string | null
  role: 'user' | 'admin'
  is_active?: boolean
  created_at?: string
}

export interface Slide {
  id: string
  conversion_id?: string
  position: number
  layout: string
  title: string
  bullets: string[]
  speaker_notes: string
  is_deleted: boolean
  created_at?: string
  updated_at?: string
}

export interface Conversion {
  id: string
  user_id?: string
  upload_id?: string
  original_filename?: string
  status: 'pending' | 'generating' | 'done' | 'failed' | 'cancelled'
  style?: string
  slide_count?: number
  theme: string
  audience_level?: string
  speaker_notes?: boolean
  tokens_used?: number
  created_at?: string
  updated_at?: string
  slides?: Slide[]
}

export interface Upload {
  id: string
  user_id?: string
  gcs_key?: string
  original_filename: string
  file_size_bytes?: number
  mime_type?: string
  parse_status?: string
  created_at?: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface RegisterResponse {
  id: string
  email: string
  name: string | null
  role: string
  is_active: boolean
  created_at: string
}

export interface AdminMetrics {
  total_users: number
  total_conversions: number
  conversions_today: number
  failed_today: number
  ai_cost_today_usd: number
}

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  is_active: boolean
  created_at: string
  conversion_count: number
}

export interface AdminUserListResponse {
  items: AdminUser[]
  total: number
  page: number
}

export interface AuditLogEntry {
  id: string
  actor_email: string | null
  action: string
  target_type: string | null
  target_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface AuditLogListResponse {
  items: AuditLogEntry[]
  total: number
  page: number
}

export interface ConversionListResponse {
  items: Conversion[]
  total: number
}

export interface Theme {
  id: string
  name: string
  bg: string      // slide background — matches backend
  text: string    // slide text color — matches backend
  accent: string  // accent/highlight color — matches backend
}

// Colors MUST match pitchmind-backend/app/services/themes.py exactly
export const THEMES: Theme[] = [
  { id: 'executive_modern', name: 'Executive Modern', bg: '#FFFFFF', text: '#1A1A1A', accent: '#0F6E56' },
  { id: 'corporate_zenith', name: 'Corporate Zenith', bg: '#1A2A1A', text: '#FFFFFF', accent: '#1D9E75' },
  { id: 'digital_frontier', name: 'Digital Frontier', bg: '#0A1628', text: '#FFFFFF', accent: '#5DCAA5' },
  { id: 'nordic_flow',      name: 'Nordic Flow',      bg: '#F5F4F0', text: '#1A1A1A', accent: '#1D9E75' },
  { id: 'midnight_insight', name: 'Midnight Insight', bg: '#1A1A1A', text: '#FFFFFF', accent: '#C8850A' },
  { id: 'executive_gold',   name: 'Executive Gold',   bg: '#0D0D0D', text: '#FFFFFF', accent: '#C8850A' },
]

export const THEME_IDS = THEMES.map(t => t.id) as [string, ...string[]]
