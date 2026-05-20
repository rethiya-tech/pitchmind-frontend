import { useAuthStore } from '@/stores/authStore'

const BASE = import.meta.env.VITE_API_URL ?? ''

/** Absolute URL for a rendered template slide image (real uploaded design).
 * Auth is passed as a query token so it works as an <img src>. */
export function templateSlideImageUrl(templateId: string, idx: number): string {
  const token = useAuthStore.getState().token ?? ''
  return `${BASE}/api/v1/templates/${templateId}/slide-image/${idx}?token=${encodeURIComponent(token)}`
}

/** Absolute URL for a rendered conversion slide image (editor backdrop for
 * template-copied decks). 404s when the conversion has no source design. */
export function conversionSlideImageUrl(conversionId: string, idx: number): string {
  const token = useAuthStore.getState().token ?? ''
  return `${BASE}/api/v1/conversions/${conversionId}/slide-image/${idx}?token=${encodeURIComponent(token)}`
}

/** Resolve a slide's background_image_url for use as a CSS background-image.
 * Paths starting with /api/ are token-protected — this appends the current
 * auth token so the browser can fetch them without a Bearer header. */
export function resolveSlideBackgroundUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('/api/')) {
    const token = useAuthStore.getState().token ?? ''
    return `${BASE}${url}?token=${encodeURIComponent(token)}`
  }
  return url
}
