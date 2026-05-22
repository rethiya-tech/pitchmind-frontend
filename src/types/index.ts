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
  share_token?: string | null
  is_shared?: boolean
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
  bg: string           // slide background — matches backend
  text: string         // slide text color — matches backend
  accent: string       // accent/highlight color — matches backend
  category: 'professional' | 'creative' | 'minimal'
  headingFont: string  // Google Font for slide titles
  bodyFont: string     // Google Font for body text / bullets
  gradient: string     // CSS gradient — used as background fallback when no PNG
  decor?: string       // optional SVG decoration style — hash-derived if absent
}

// Colors MUST match pitchmind-backend/app/services/themes.py exactly
export const THEMES: Theme[] = [
  // ── Professional ─────────────────────────────────────────────────────────
  {
    id: 'clean_slate', name: 'Slate Pro', category: 'professional',
    bg: '#1E2A3A', text: '#FFFFFF', accent: '#60A5FA',
    headingFont: 'Playfair Display', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #1E2A3A 0%, #243248 50%, #162030 100%)',
  },
  {
    id: 'navy_gold', name: 'Navy Gold', category: 'professional',
    bg: '#0A1628', text: '#FFFFFF', accent: '#D4A017',
    headingFont: 'Cormorant Garamond', bodyFont: 'Montserrat',
    gradient: 'linear-gradient(135deg, #0A1628 0%, #10203E 50%, #070E1C 100%)',
  },
  {
    id: 'dark_tech', name: 'Dark Tech', category: 'professional',
    bg: '#0D1117', text: '#F9FAFB', accent: '#06B6D4',
    headingFont: 'Space Grotesk', bodyFont: 'Space Grotesk',
    gradient: 'linear-gradient(135deg, #0D1117 0%, #131B26 50%, #0A0E14 100%)',
  },
  {
    id: 'charcoal_amber', name: 'Charcoal Amber', category: 'professional',
    bg: '#1C2030', text: '#F3F4F6', accent: '#F59E0B',
    headingFont: 'Montserrat', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #1C2030 0%, #242840 50%, #161820 100%)',
  },
  {
    id: 'steel_blue', name: 'Steel Blue', category: 'professional',
    bg: '#1A3050', text: '#FFFFFF', accent: '#60A5FA',
    headingFont: 'Montserrat', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #1A3050 0%, #1E3A60 50%, #142840 100%)',
  },
  {
    id: 'forest_pro', name: 'Forest Pro', category: 'professional',
    bg: '#04321E', text: '#FFFFFF', accent: '#34D399',
    headingFont: 'Playfair Display', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #04321E 0%, #063D26 50%, #032818 100%)',
  },
  {
    id: 'midnight_black', name: 'Midnight', category: 'professional',
    bg: '#0A0A0A', text: '#FFFFFF', accent: '#EAB308',
    headingFont: 'Bebas Neue', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #0A0A0A 0%, #141414 40%, #0C0C10 100%)',
  },
  {
    id: 'burgundy_suit', name: 'Burgundy', category: 'professional',
    bg: '#2D0A0A', text: '#FFFFFF', accent: '#F87171',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #2D0A0A 0%, #3A1010 50%, #220808 100%)',
  },
  {
    id: 'prussian_blue', name: 'Prussian Blue', category: 'professional',
    bg: '#001F3F', text: '#FFFFFF', accent: '#7DD3FC',
    headingFont: 'Playfair Display', bodyFont: 'Montserrat',
    gradient: 'linear-gradient(135deg, #001F3F 0%, #002850 50%, #001530 100%)',
  },
  // ── Creative ─────────────────────────────────────────────────────────────
  {
    id: 'vivid_purple', name: 'Vivid Purple', category: 'creative',
    bg: '#150228', text: '#FFFFFF', accent: '#A855F7',
    headingFont: 'Syne', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #150228 0%, #1E0535 50%, #260A40 100%)',
  },
  {
    id: 'sunset_orange', name: 'Sunset Orange', category: 'creative',
    bg: '#170500', text: '#FFFFFF', accent: '#F97316',
    headingFont: 'Montserrat', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #170500 0%, #200800 50%, #130400 100%)',
  },
  {
    id: 'ocean_teal', name: 'Ocean Teal', category: 'creative',
    bg: '#001818', text: '#FFFFFF', accent: '#14B8A6',
    headingFont: 'Poppins', bodyFont: 'Poppins',
    gradient: 'linear-gradient(135deg, #001818 0%, #002525 50%, #001515 100%)',
  },
  {
    id: 'neon_blue', name: 'Neon Blue', category: 'creative',
    bg: '#000A16', text: '#F0F9FF', accent: '#38BDF8',
    headingFont: 'Space Grotesk', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #000A16 0%, #000F22 50%, #000810 100%)',
  },
  {
    id: 'ruby_red', name: 'Ruby Red', category: 'creative',
    bg: '#160000', text: '#FFFFFF', accent: '#F43F5E',
    headingFont: 'Syne', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #160000 0%, #200000 50%, #120000 100%)',
  },
  {
    id: 'cosmic_indigo', name: 'Cosmic Indigo', category: 'creative',
    bg: '#000818', text: '#FFFFFF', accent: '#818CF8',
    headingFont: 'Syne', bodyFont: 'Space Grotesk',
    gradient: 'linear-gradient(135deg, #000818 0%, #000C22 50%, #00060F 100%)',
  },
  {
    id: 'rose_bloom', name: 'Rose Bloom', category: 'creative',
    bg: '#1A0010', text: '#FFFFFF', accent: '#FB7185',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #1A0010 0%, #240018 50%, #160010 100%)',
  },
  {
    id: 'electric_lime', name: 'Electric Lime', category: 'creative',
    bg: '#001A00', text: '#FFFFFF', accent: '#84CC16',
    headingFont: 'Space Grotesk', bodyFont: 'Space Grotesk',
    gradient: 'linear-gradient(135deg, #001A00 0%, #002400 50%, #001400 100%)',
  },
  {
    id: 'aurora', name: 'Aurora', category: 'creative',
    bg: '#06081A', text: '#FFFFFF', accent: '#A78BFA',
    headingFont: 'Syne', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #06081A 0%, #0A0D28 50%, #060818 100%)',
  },
  // ── Minimal ───────────────────────────────────────────────────────────────
  {
    id: 'pure_white', name: 'Pure White', category: 'minimal',
    bg: '#FFFFFF', text: '#1F2937', accent: '#3B82F6',
    headingFont: 'Inter', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
  },
  {
    id: 'warm_ivory', name: 'Warm Ivory', category: 'minimal',
    bg: '#FFFDF5', text: '#292524', accent: '#D97706',
    headingFont: 'Playfair Display', bodyFont: 'Playfair Display',
    gradient: 'linear-gradient(135deg, #FFFDF5 0%, #FFF8E5 100%)',
  },
  {
    id: 'soft_grey', name: 'Soft Grey', category: 'minimal',
    bg: '#F8F9FA', text: '#1F2937', accent: '#475569',
    headingFont: 'DM Sans', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #F8F9FA 0%, #EEF1F5 100%)',
  },
  {
    id: 'light_pearl', name: 'Light Pearl', category: 'minimal',
    bg: '#EEF2FF', text: '#1E3A5F', accent: '#4F46E5',
    headingFont: 'Poppins', bodyFont: 'Poppins',
    gradient: 'linear-gradient(135deg, #EEF2FF 0%, #E4EAFF 100%)',
  },
  {
    id: 'sage_mist', name: 'Sage Mist', category: 'minimal',
    bg: '#F2F7F2', text: '#14532D', accent: '#16A34A',
    headingFont: 'Playfair Display', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #F2F7F2 0%, #E8F2E8 100%)',
  },
  {
    id: 'warm_slate', name: 'Warm Slate', category: 'minimal',
    bg: '#F4F6F8', text: '#334155', accent: '#64748B',
    headingFont: 'DM Sans', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #F4F6F8 0%, #E8EEF4 100%)',
  },
  {
    id: 'blush_rose', name: 'Blush Rose', category: 'minimal',
    bg: '#FFF0F3', text: '#881337', accent: '#E11D48',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #FFF0F3 0%, #FFE4EE 100%)',
  },
  {
    id: 'arctic_sky', name: 'Arctic Sky', category: 'minimal',
    bg: '#F0F9FF', text: '#0C4A6E', accent: '#0284C7',
    headingFont: 'Poppins', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FF 100%)',
  },
  {
    id: 'mint_fresh', name: 'Mint Fresh', category: 'minimal',
    bg: '#F0FFF4', text: '#14532D', accent: '#15803D',
    headingFont: 'Poppins', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #F0FFF4 0%, #E0FFE8 100%)',
  },

  // ── Premium Professional ─────────────────────────────────────────────────
  {
    id: 'velvet_plum', name: 'Velvet Plum', category: 'professional',
    bg: '#160820', text: '#F0E8FF', accent: '#9D7FC8',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #160820 0%, #200C30 50%, #120618 100%)',
  },
  {
    id: 'emerald_luxe', name: 'Emerald Luxe', category: 'professional',
    bg: '#071C12', text: '#E0F5EC', accent: '#2DB87A',
    headingFont: 'Cormorant Garamond', bodyFont: 'Montserrat',
    gradient: 'linear-gradient(135deg, #071C12 0%, #0B2C1C 50%, #051410 100%)',
  },
  {
    id: 'titanium', name: 'Titanium', category: 'professional',
    bg: '#0F1014', text: '#E8E8EC', accent: '#A0A0B0',
    headingFont: 'Space Grotesk', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #0F1014 0%, #181820 50%, #0C0C10 100%)',
  },
  {
    id: 'mahogany', name: 'Mahogany', category: 'professional',
    bg: '#1C0A06', text: '#F5EDE8', accent: '#9B4A2C',
    headingFont: 'Playfair Display', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #1C0A06 0%, #28120A 50%, #160808 100%)',
  },
  {
    id: 'arctic_night', name: 'Arctic Night', category: 'professional',
    bg: '#091528', text: '#D8EEF8', accent: '#5BAAD8',
    headingFont: 'Montserrat', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #091528 0%, #0C1E38 50%, #061020 100%)',
  },
  {
    id: 'champagne_noir', name: 'Champagne Noir', category: 'professional',
    bg: '#1A1608', text: '#F8F0D8', accent: '#D4B870',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #1A1608 0%, #241E0C 50%, #141208 100%)',
  },
  {
    id: 'cobalt_elite', name: 'Cobalt Elite', category: 'professional',
    bg: '#060C28', text: '#E8EEF8', accent: '#5B78EB',
    headingFont: 'Space Grotesk', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #060C28 0%, #0A1235 50%, #040A20 100%)',
  },
  {
    id: 'onyx_slate', name: 'Onyx Slate', category: 'professional',
    bg: '#141820', text: '#E8EEF0', accent: '#7890A0',
    headingFont: 'Montserrat', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #141820 0%, #1C2030 50%, #10141C 100%)',
  },
  {
    id: 'obsidian_gold', name: 'Obsidian Gold', category: 'professional',
    bg: '#0C0C10', text: '#F0EDE8', accent: '#C9A96E',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #0C0C10 0%, #181820 40%, #0A0A0E 100%)',
  },
  {
    id: 'smoke_copper', name: 'Smoke & Copper', category: 'professional',
    bg: '#1A1210', text: '#F0EDE8', accent: '#C07843',
    headingFont: 'Playfair Display', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #1A1210 0%, #221A14 50%, #150E08 100%)',
  },
  {
    id: 'deep_navy', name: 'Deep Navy', category: 'professional',
    bg: '#091525', text: '#E8EFF8', accent: '#4DA6FF',
    headingFont: 'Montserrat', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #091525 0%, #0C1E35 50%, #060F1C 100%)',
  },

  // ── Premium Creative ─────────────────────────────────────────────────────
  {
    id: 'ultraviolet', name: 'Ultraviolet', category: 'creative',
    bg: '#0A001A', text: '#E8D8FF', accent: '#8040FF',
    headingFont: 'Syne', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #0A001A 0%, #140026 50%, #08001A 100%)',
  },
  {
    id: 'solar_flare', name: 'Solar Flare', category: 'creative',
    bg: '#1A0A00', text: '#FFF8E8', accent: '#FF8C00',
    headingFont: 'Syne', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #1A0A00 0%, #220E00 50%, #150800 100%)',
  },
  {
    id: 'cyber_green', name: 'Cyber Green', category: 'creative',
    bg: '#001A08', text: '#D8FFE8', accent: '#00E87A',
    headingFont: 'Space Grotesk', bodyFont: 'Space Grotesk',
    gradient: 'linear-gradient(135deg, #001A08 0%, #002410 50%, #001408 100%)',
  },
  {
    id: 'arctic_aurora', name: 'Arctic Aurora', category: 'creative',
    bg: '#060A1A', text: '#E8F8FF', accent: '#38D4F0',
    headingFont: 'Syne', bodyFont: 'Poppins',
    gradient: 'linear-gradient(135deg, #060A1A 0%, #0A1028 50%, #060818 100%)',
  },
  {
    id: 'velvet_crimson', name: 'Velvet Crimson', category: 'creative',
    bg: '#1A0308', text: '#FFE8EC', accent: '#E83050',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #1A0308 0%, #22060E 50%, #150206 100%)',
  },
  {
    id: 'golden_hour', name: 'Golden Hour', category: 'creative',
    bg: '#1A1000', text: '#FFF8E0', accent: '#F0A020',
    headingFont: 'Playfair Display', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #1A1000 0%, #221600 50%, #140E00 100%)',
  },
  {
    id: 'deep_space', name: 'Deep Space', category: 'creative',
    bg: '#04050E', text: '#D8E0FF', accent: '#6060FF',
    headingFont: 'Space Grotesk', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #04050E 0%, #08091A 50%, #030408 100%)',
  },
  {
    id: 'sakura', name: 'Sakura', category: 'creative',
    bg: '#1A0A0E', text: '#FFE8EE', accent: '#FF7098',
    headingFont: 'Cormorant Garamond', bodyFont: 'Poppins',
    gradient: 'linear-gradient(135deg, #1A0A0E 0%, #221018 50%, #150808 100%)',
  },
  {
    id: 'noir_cinema', name: 'Noir Cinema', category: 'creative',
    bg: '#0A0A08', text: '#F8F8F0', accent: '#ECC94B',
    headingFont: 'Bebas Neue', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #0A0A08 0%, #141410 40%, #0A0A06 100%)',
  },
  {
    id: 'rose_quartz', name: 'Rose Quartz', category: 'creative',
    bg: '#1C0A12', text: '#FFE8F0', accent: '#E8819C',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #1C0A12 0%, #261018 50%, #160810 100%)',
  },
  {
    id: 'absinthe', name: 'Absinthe', category: 'creative',
    bg: '#0A1808', text: '#EAFFF0', accent: '#4ADE80',
    headingFont: 'Syne', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #0A1808 0%, #0F2010 50%, #081408 100%)',
  },

  // ── Premium Minimal ──────────────────────────────────────────────────────
  {
    id: 'linen', name: 'Linen', category: 'minimal',
    bg: '#F8F2E8', text: '#2C2010', accent: '#A08050',
    headingFont: 'Playfair Display', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #F8F2E8 0%, #F0E8D8 100%)',
  },
  {
    id: 'concrete', name: 'Concrete', category: 'minimal',
    bg: '#EAEAEA', text: '#1C1C1C', accent: '#808080',
    headingFont: 'Space Grotesk', bodyFont: 'Space Grotesk',
    gradient: 'linear-gradient(135deg, #EAEAEA 0%, #DCDCDC 100%)',
  },
  {
    id: 'ivory_noir', name: 'Ivory Noir', category: 'minimal',
    bg: '#FAFAF8', text: '#0A0A08', accent: '#1A1A18',
    headingFont: 'DM Sans', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #FAFAF8 0%, #F2F2EE 100%)',
  },
  {
    id: 'lavender_mist', name: 'Lavender Mist', category: 'minimal',
    bg: '#F5F0FF', text: '#2A1854', accent: '#7C54C8',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #F5F0FF 0%, #ECE4FF 100%)',
  },
  {
    id: 'peach_cream', name: 'Peach Cream', category: 'minimal',
    bg: '#FFF5EE', text: '#3A1808', accent: '#C87840',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #FFF5EE 0%, #FFE8D8 100%)',
  },
  {
    id: 'ocean_mist', name: 'Ocean Mist', category: 'minimal',
    bg: '#EEF4F8', text: '#1C2E3A', accent: '#4A7890',
    headingFont: 'Poppins', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #EEF4F8 0%, #E0EEF4 100%)',
  },
  {
    id: 'slate_marble', name: 'Slate Marble', category: 'minimal',
    bg: '#F2F2F0', text: '#1A1A1A', accent: '#505058',
    headingFont: 'Playfair Display', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #F2F2F0 0%, #E8E8E4 100%)',
  },
  {
    id: 'rose_petal', name: 'Rose Petal', category: 'minimal',
    bg: '#FDF5F5', text: '#4A1818', accent: '#C05858',
    headingFont: 'Playfair Display', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #FDF5F5 0%, #F8E8E8 100%)',
  },
  {
    id: 'porcelain', name: 'Porcelain', category: 'minimal',
    bg: '#F8F6F3', text: '#1C1C1E', accent: '#6B7280',
    headingFont: 'Inter', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #F8F6F3 0%, #F0EDE8 100%)',
  },
  {
    id: 'sand_dune', name: 'Sand Dune', category: 'minimal',
    bg: '#F5EDE0', text: '#2C1810', accent: '#B8895A',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #F5EDE0 0%, #EDE0C8 100%)',
  },
  {
    id: 'graphite', name: 'Graphite', category: 'minimal',
    bg: '#F0F2F5', text: '#1C2433', accent: '#5B7FA6',
    headingFont: 'DM Sans', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #F0F2F5 0%, #E4E8EF 100%)',
  },

  // ── New Professional ─────────────────────────────────────────────────────
  {
    id: 'warm_cognac', name: 'Warm Cognac', category: 'professional',
    bg: '#1E0C06', text: '#F8F0E8', accent: '#C87040',
    headingFont: 'Playfair Display', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #1E0C06 0%, #2A1008 50%, #160806 100%)',
  },
  {
    id: 'graphite_steel', name: 'Graphite Steel', category: 'professional',
    bg: '#141C28', text: '#E0E8F8', accent: '#5090E0',
    headingFont: 'Space Grotesk', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #141C28 0%, #1C2838 50%, #101828 100%)',
  },
  {
    id: 'hunter_green', name: 'Hunter Green', category: 'professional',
    bg: '#0C2018', text: '#D8F0E0', accent: '#3CB870',
    headingFont: 'Playfair Display', bodyFont: 'Montserrat',
    gradient: 'linear-gradient(135deg, #0C2018 0%, #102818 50%, #0A1A10 100%)',
  },
  {
    id: 'midnight_cobalt', name: 'Midnight Cobalt', category: 'professional',
    bg: '#041030', text: '#D0DFFF', accent: '#4870FF',
    headingFont: 'Space Grotesk', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #041030 0%, #081840 50%, #030C20 100%)',
  },
  {
    id: 'royal_burgundy', name: 'Royal Burgundy', category: 'professional',
    bg: '#1E0818', text: '#FFE0E8', accent: '#D84070',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #1E0818 0%, #280C20 50%, #180618 100%)',
  },
  {
    id: 'ocean_slate', name: 'Ocean Slate', category: 'professional',
    bg: '#0A2438', text: '#D0E8F8', accent: '#50A0D8',
    headingFont: 'Montserrat', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #0A2438 0%, #0E2D48 50%, #081C2C 100%)',
  },
  {
    id: 'bronze_empire', name: 'Bronze Empire', category: 'professional',
    bg: '#1A1008', text: '#F0E8D8', accent: '#C09050',
    headingFont: 'Cormorant Garamond', bodyFont: 'Montserrat',
    gradient: 'linear-gradient(135deg, #1A1008 0%, #221808 50%, #140E08 100%)',
  },
  {
    id: 'slate_violet', name: 'Slate Violet', category: 'professional',
    bg: '#180C2C', text: '#E8D8FF', accent: '#8050D0',
    headingFont: 'Space Grotesk', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #180C2C 0%, #201040 50%, #140820 100%)',
  },
  {
    id: 'forest_ink', name: 'Forest Ink', category: 'professional',
    bg: '#091814', text: '#D0F0E4', accent: '#30B888',
    headingFont: 'Playfair Display', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #091814 0%, #0C2018 50%, #071010 100%)',
  },
  {
    id: 'onyx_copper', name: 'Onyx Copper', category: 'professional',
    bg: '#1C1010', text: '#F0E8E0', accent: '#B07050',
    headingFont: 'Playfair Display', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #1C1010 0%, #241818 50%, #180C0C 100%)',
  },

  // ── New Creative ─────────────────────────────────────────────────────────
  {
    id: 'retrowave', name: 'Retrowave', category: 'creative',
    bg: '#1A0438', text: '#FFD8F8', accent: '#FF4AC8',
    headingFont: 'Syne', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #1A0438 0%, #240848 50%, #0E0228 100%)',
  },
  {
    id: 'tropic_night', name: 'Tropic Night', category: 'creative',
    bg: '#001C18', text: '#D0FFF0', accent: '#00E8A0',
    headingFont: 'Space Grotesk', bodyFont: 'Poppins',
    gradient: 'linear-gradient(135deg, #001C18 0%, #002820 50%, #001410 100%)',
  },
  {
    id: 'coral_ember', name: 'Coral Ember', category: 'creative',
    bg: '#200408', text: '#FFE8E0', accent: '#FF5040',
    headingFont: 'Syne', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #200408 0%, #2C0810 50%, #180406 100%)',
  },
  {
    id: 'citrus_dark', name: 'Citrus Dark', category: 'creative',
    bg: '#181400', text: '#FFFCE0', accent: '#D4C000',
    headingFont: 'Space Grotesk', bodyFont: 'Space Grotesk',
    gradient: 'linear-gradient(135deg, #181400 0%, #201C00 50%, #140E00 100%)',
  },
  {
    id: 'electric_teal', name: 'Electric Teal', category: 'creative',
    bg: '#001C24', text: '#D0F8FF', accent: '#00D0F0',
    headingFont: 'Space Grotesk', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #001C24 0%, #002830 50%, #001418 100%)',
  },
  {
    id: 'magenta_noir', name: 'Magenta Noir', category: 'creative',
    bg: '#1E0024', text: '#FFD8FF', accent: '#C000D8',
    headingFont: 'Syne', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #1E0024 0%, #280030 50%, #140020 100%)',
  },
  {
    id: 'copper_dusk', name: 'Copper Dusk', category: 'creative',
    bg: '#1C0C04', text: '#FFE8D0', accent: '#D86820',
    headingFont: 'Playfair Display', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #1C0C04 0%, #261408 50%, #160A04 100%)',
  },
  {
    id: 'jade_nebula', name: 'Jade Nebula', category: 'creative',
    bg: '#021A10', text: '#D0FFE8', accent: '#20D880',
    headingFont: 'Space Grotesk', bodyFont: 'Space Grotesk',
    gradient: 'linear-gradient(135deg, #021A10 0%, #042816 50%, #021008 100%)',
  },
  {
    id: 'midnight_bloom', name: 'Midnight Bloom', category: 'creative',
    bg: '#140028', text: '#E8D0FF', accent: '#9040E0',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #140028 0%, #1C0038 50%, #0E0020 100%)',
  },
  {
    id: 'neon_sunset', name: 'Neon Sunset', category: 'creative',
    bg: '#180820', text: '#FFE8D8', accent: '#FF6050',
    headingFont: 'Syne', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #180820 0%, #200C28 50%, #140618 100%)',
  },

  // ── New Minimal ──────────────────────────────────────────────────────────
  {
    id: 'paper', name: 'Paper', category: 'minimal',
    bg: '#F6F4EE', text: '#3C3020', accent: '#9A7848',
    headingFont: 'Playfair Display', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #F6F4EE 0%, #EEE8D8 100%)',
  },
  {
    id: 'clay', name: 'Clay', category: 'minimal',
    bg: '#F5EFE6', text: '#3A2010', accent: '#C07840',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #F5EFE6 0%, #EDE0CC 100%)',
  },
  {
    id: 'moss_light', name: 'Moss Light', category: 'minimal',
    bg: '#EFF4ED', text: '#1A3018', accent: '#3A9040',
    headingFont: 'Playfair Display', bodyFont: 'DM Sans',
    gradient: 'linear-gradient(135deg, #EFF4ED 0%, #E4EEE0 100%)',
  },
  {
    id: 'dusty_rose_light', name: 'Dusty Rose', category: 'minimal',
    bg: '#F8EEEE', text: '#3A1818', accent: '#D06060',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #F8EEEE 0%, #F0E0E0 100%)',
  },
  {
    id: 'caramel', name: 'Caramel', category: 'minimal',
    bg: '#FBF0E4', text: '#3A1C08', accent: '#C86830',
    headingFont: 'Playfair Display', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #FBF0E4 0%, #F0E0C8 100%)',
  },
  {
    id: 'thistle', name: 'Thistle', category: 'minimal',
    bg: '#F4EFF8', text: '#2A1848', accent: '#8050C8',
    headingFont: 'Cormorant Garamond', bodyFont: 'Raleway',
    gradient: 'linear-gradient(135deg, #F4EFF8 0%, #EAE0F4 100%)',
  },
  {
    id: 'wheat', name: 'Wheat', category: 'minimal',
    bg: '#F9F4E8', text: '#302010', accent: '#A07830',
    headingFont: 'Playfair Display', bodyFont: 'Montserrat',
    gradient: 'linear-gradient(135deg, #F9F4E8 0%, #F0E8D0 100%)',
  },
  {
    id: 'fog', name: 'Fog', category: 'minimal',
    bg: '#EEF0F2', text: '#1C2830', accent: '#508090',
    headingFont: 'DM Sans', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #EEF0F2 0%, #E0E8EC 100%)',
  },
  {
    id: 'dusk_light', name: 'Dusk Light', category: 'minimal',
    bg: '#EEF0F8', text: '#182038', accent: '#4060B0',
    headingFont: 'Poppins', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #EEF0F8 0%, #E0E4F4 100%)',
  },
  {
    id: 'steel_sky', name: 'Steel Sky', category: 'minimal',
    bg: '#E8F0F8', text: '#1A2A3A', accent: '#3870B0',
    headingFont: 'Montserrat', bodyFont: 'Inter',
    gradient: 'linear-gradient(135deg, #E8F0F8 0%, #D8E8F4 100%)',
  },
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
