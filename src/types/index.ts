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
  active_users_today: number
  total_conversions: number
  done_conversions: number
  conversions_today: number
  failed_today: number
  total_slides: number
  success_rate: number
  ai_cost_today_usd: number
  ai_cost_total_usd: number
  total_tokens: number
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

export interface AdminConversion {
  id: string
  user_id: string | null
  user_email: string | null
  user_name: string | null
  original_filename: string | null
  status: string
  theme: string | null
  slide_count: number | null
  tokens_used: number | null
  created_at: string
}

export interface AdminConversionListResponse {
  items: AdminConversion[]
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
  { id: 'clean_slate',     name: 'Slate Pro',       bg: '#1E2A3A', text: '#FFFFFF', accent: '#60A5FA' },
  { id: 'navy_gold',       name: 'Navy Gold',       bg: '#0A1628', text: '#FFFFFF', accent: '#D4A017' },
  { id: 'dark_tech',       name: 'Dark Tech',       bg: '#0D1117', text: '#F9FAFB', accent: '#06B6D4' },
  { id: 'charcoal_amber',  name: 'Charcoal Amber',  bg: '#1C2030', text: '#F3F4F6', accent: '#F59E0B' },
  { id: 'steel_blue',      name: 'Steel Blue',      bg: '#1A3050', text: '#FFFFFF', accent: '#60A5FA' },
  { id: 'forest_pro',      name: 'Forest Pro',      bg: '#04321E', text: '#FFFFFF', accent: '#34D399' },
]

export const THEME_IDS = THEMES.map(t => t.id) as [string, ...string[]]
