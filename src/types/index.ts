export type AccountStatus = 'pending' | 'active' | 'suspended' | 'rejected'

export interface User {
  id: string
  email: string
  name: string | null
  role: 'user' | 'admin'
  is_active?: boolean
  status?: AccountStatus
  must_change_password?: boolean
  created_at?: string
}

export interface Slide {
  id: string
  conversion_id?: string
  position: number
  layout: string
  title: string
  bullets: string[]
  text_styles?: SlideTextStyles
  speaker_notes: string
  background_image_url?: string
  is_deleted: boolean
  color_scheme: string
  shape_style: string
  created_at?: string
  updated_at?: string
}

export interface SlideTextStyle {
  fontFamily?: string
  fontWeight?: number
  fontSize?: number
  color?: string
  italic?: boolean
}

export interface SlideTextStyles {
  title?: SlideTextStyle
  bullets?: Record<string, SlideTextStyle>
}

export interface Conversion {
  id: string
  user_id?: string
  upload_id?: string
  original_filename?: string
  name?: string
  status: 'pending' | 'generating' | 'done' | 'failed' | 'cancelled'
  style?: string
  slide_count?: number
  theme: string
  audience_level?: string
  speaker_notes?: boolean
  tokens_used?: number
  source_pptx_key?: string | null
  client_logo_url?: string | null
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
  status: AccountStatus
  message: string
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

  // Detailed Token Metrics (Today)
  input_text_tokens_today: number
  output_text_tokens_today: number
  input_audio_tokens_today: number
  output_audio_tokens_today: number
  summary_input_tokens_today: number
  summary_output_tokens_today: number

  // Detailed Token Metrics (Total)
  input_text_tokens_total: number
  output_text_tokens_total: number
  input_audio_tokens_total: number
  output_audio_tokens_total: number
  summary_input_tokens_total: number
  summary_output_tokens_total: number

  // Costs (Today)
  cost_input_text_today: number
  cost_output_text_today: number
  cost_input_audio_today: number
  cost_output_audio_today: number
  cost_summary_input_today: number
  cost_summary_output_today: number
}

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  is_active: boolean
  status: AccountStatus
  must_change_password: boolean
  created_at: string
  conversion_count: number
}

export interface AdminUserCreateResponse {
  user: AdminUser
  temporary_password: string
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
  category: 'professional' | 'creative' | 'minimal'
}

// Colors MUST match pitchmind-backend/app/services/themes.py exactly
export const THEMES: Theme[] = [
  // Professional
  { id: 'clean_slate',    name: 'Slate Pro',      bg: '#1E2A3A', text: '#FFFFFF', accent: '#60A5FA',  category: 'professional' },
  { id: 'navy_gold',      name: 'Navy Gold',      bg: '#0A1628', text: '#FFFFFF', accent: '#D4A017',  category: 'professional' },
  { id: 'dark_tech',      name: 'Dark Tech',      bg: '#0D1117', text: '#F9FAFB', accent: '#06B6D4',  category: 'professional' },
  { id: 'charcoal_amber', name: 'Charcoal Amber', bg: '#1C2030', text: '#F3F4F6', accent: '#F59E0B',  category: 'professional' },
  { id: 'steel_blue',     name: 'Steel Blue',     bg: '#1A3050', text: '#FFFFFF', accent: '#60A5FA',  category: 'professional' },
  { id: 'forest_pro',     name: 'Forest Pro',     bg: '#04321E', text: '#FFFFFF', accent: '#34D399',  category: 'professional' },
  { id: 'midnight_black', name: 'Midnight',       bg: '#0A0A0A', text: '#FFFFFF', accent: '#EAB308',  category: 'professional' },
  { id: 'burgundy_suit',  name: 'Burgundy',       bg: '#2D0A0A', text: '#FFFFFF', accent: '#F87171',  category: 'professional' },
  { id: 'prussian_blue',  name: 'Prussian Blue',  bg: '#001F3F', text: '#FFFFFF', accent: '#7DD3FC',  category: 'professional' },
  // Creative
  { id: 'vivid_purple',   name: 'Vivid Purple',   bg: '#150228', text: '#FFFFFF', accent: '#A855F7',  category: 'creative' },
  { id: 'sunset_orange',  name: 'Sunset Orange',  bg: '#170500', text: '#FFFFFF', accent: '#F97316',  category: 'creative' },
  { id: 'ocean_teal',     name: 'Ocean Teal',     bg: '#001818', text: '#FFFFFF', accent: '#14B8A6',  category: 'creative' },
  { id: 'neon_blue',      name: 'Neon Blue',      bg: '#000A16', text: '#F0F9FF', accent: '#38BDF8',  category: 'creative' },
  { id: 'ruby_red',       name: 'Ruby Red',       bg: '#160000', text: '#FFFFFF', accent: '#F43F5E',  category: 'creative' },
  { id: 'cosmic_indigo',  name: 'Cosmic Indigo',  bg: '#000818', text: '#FFFFFF', accent: '#818CF8',  category: 'creative' },
  { id: 'rose_bloom',     name: 'Rose Bloom',     bg: '#1A0010', text: '#FFFFFF', accent: '#FB7185',  category: 'creative' },
  { id: 'electric_lime',  name: 'Electric Lime',  bg: '#001A00', text: '#FFFFFF', accent: '#84CC16',  category: 'creative' },
  { id: 'aurora',         name: 'Aurora',         bg: '#06081A', text: '#FFFFFF', accent: '#A78BFA',  category: 'creative' },
  // Minimal
  { id: 'pure_white',     name: 'Pure White',     bg: '#FFFFFF', text: '#1F2937', accent: '#3B82F6',  category: 'minimal' },
  { id: 'warm_ivory',     name: 'Warm Ivory',     bg: '#FFFDF5', text: '#292524', accent: '#D97706',  category: 'minimal' },
  { id: 'soft_grey',      name: 'Soft Grey',      bg: '#F8F9FA', text: '#1F2937', accent: '#475569',  category: 'minimal' },
  { id: 'light_pearl',    name: 'Light Pearl',    bg: '#EEF2FF', text: '#1E3A5F', accent: '#4F46E5',  category: 'minimal' },
  { id: 'sage_mist',      name: 'Sage Mist',      bg: '#F2F7F2', text: '#14532D', accent: '#16A34A',  category: 'minimal' },
  { id: 'warm_slate',     name: 'Warm Slate',     bg: '#F4F6F8', text: '#334155', accent: '#64748B',  category: 'minimal' },
  { id: 'blush_rose',     name: 'Blush Rose',     bg: '#FFF0F3', text: '#881337', accent: '#E11D48',  category: 'minimal' },
  { id: 'arctic_sky',     name: 'Arctic Sky',     bg: '#F0F9FF', text: '#0C4A6E', accent: '#0284C7',  category: 'minimal' },
  { id: 'mint_fresh',     name: 'Mint Fresh',     bg: '#F0FFF4', text: '#14532D', accent: '#15803D',  category: 'minimal' },
]

export const THEME_IDS = THEMES.map(t => t.id) as [string, ...string[]]

// ── Template types ─────────────────────────────────────────────────────────────

export interface TemplateSlide {
  position: number
  layout: string
  title: string
  bullets: string[]
  speaker_notes: string
}

export interface Template {
  id: string
  name: string
  description: string | null
  thumbnail_url: string | null
  slide_count: number
  theme: string | null
  is_active: boolean
  is_public: boolean
  sort_order?: number
  preview_count?: number
  custom_bg?: string | null
  custom_text?: string | null
  custom_accent?: string | null
  created_by: string | null
  created_at: string
}

export interface TemplateDetail extends Template {
  slides_json: TemplateSlide[]
}

export interface TemplateListResponse {
  items: Template[]
  total: number
}

export interface TemplateCopyResponse {
  conversion_id: string
  slide_count: number
}

export interface TemplateGenerateRequest {
  name: string
  description?: string
  layouts: string[]
  theme?: string
  custom_bg?: string
  custom_text?: string
  custom_accent?: string
  slide_count: number
  style: 'professional' | 'creative' | 'minimal'
  use_ai?: boolean
}
