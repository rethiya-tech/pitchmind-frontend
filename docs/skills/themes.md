# Skill: Themes

## Overview
Themes are visual presets for PPTX export. The frontend displays theme names
and color swatches in a picker — actual PPTX rendering is server-side.

## Available themes

| ID | Display Name | Primary Color | Accent Color |
|----|--------------|---------------|--------------|
| `executive_modern` | Executive Modern | `#1A1A2E` | `#E8B86D` |
| `corporate_zenith` | Corporate Zenith | `#003366` | `#0099CC` |
| `digital_frontier` | Digital Frontier | `#0D1117` | `#00FF88` |
| `nordic_flow` | Nordic Flow | `#F5F5F0` | `#2D6A4F` |
| `midnight_insight` | Midnight Insight | `#1A1A2E` | `#7B68EE` |
| `executive_gold` | Executive Gold | `#1C1C1C` | `#C9A84C` |

**Default theme**: `executive_gold`

## ThemePicker component
```typescript
interface ThemePickerProps {
  value: string
  onChange: (themeId: string) => void
  disabled?: boolean
}
// Display a grid of 6 theme cards
// Each card: color swatch (primary bg + accent stripe) + display name
// Selected card: ring-2 ring-pm-teal
// Disabled: opacity-50 pointer-events-none (during generation)
```

## Theme swatch rendering
Each swatch is a 64×40px div with:
- Background: primary color
- Bottom stripe (8px): accent color
- Border radius: rounded-lg
- On hover (not disabled): scale-105 transition

## Where themes appear
1. `/upload` page — ThemePicker shown after file selected, before submit
2. `/editor/:id` page — ThemeBadge in toolbar (display-only, not editable)
3. `/export/:id` page — ThemePreviewCard showing selected theme

## Validation
The `theme` field in conversion create form is validated against the 6 IDs.
Unknown theme IDs should never reach the backend — use a Zod enum in the
upload form schema.
