import { test, expect } from '@playwright/test'


test.describe('Landing page', () => {
  test('shows hero headline', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('has Get Started CTA that links to register', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByRole('link', { name: /get started/i })
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute('href', /register/)
  })

  test('shows Sign in link for existing users', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
  })

  test('shows how it works section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/how it works/i)).toBeVisible()
  })

  test('shows 6 theme swatches', async ({ page }) => {
    await page.goto('/')
    const swatches = page.locator('[data-testid="theme-swatch"]')
    await expect(swatches).toHaveCount(6)
  })
})
