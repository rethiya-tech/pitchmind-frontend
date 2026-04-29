import { test, expect } from '@playwright/test'


test.describe('Slide editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL ?? 'test@example.com')
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD ?? 'testpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/dashboard/)
  })

  test('editor shows slide list', async ({ page }) => {
    await page.goto('/editor/fake-conversion-id')
    await expect(page.locator('[data-testid="slide-card"]').first()).toBeVisible()
  })

  test('editor toolbar shows save indicator', async ({ page }) => {
    await page.goto('/editor/fake-conversion-id')
    await expect(page.getByText(/saved|saving/i)).toBeVisible()
  })

  test('editor toolbar shows export button', async ({ page }) => {
    await page.goto('/editor/fake-conversion-id')
    await expect(page.getByRole('button', { name: /export|download/i })).toBeVisible()
  })

  test('editing a slide title triggers saving indicator', async ({ page }) => {
    await page.goto('/editor/fake-conversion-id')
    const titleEl = page.locator('[data-testid="slide-title"]').first()
    await titleEl.click()
    await titleEl.press('End')
    await titleEl.type(' edited')
    await expect(page.getByText(/saving/i)).toBeVisible({ timeout: 2000 })
  })

  test('delete slide button triggers undo toast', async ({ page }) => {
    await page.goto('/editor/fake-conversion-id')
    await page.locator('[data-testid="slide-delete-btn"]').first().click()
    await expect(page.getByText(/undo/i)).toBeVisible()
  })

  test('add slide button inserts new slide', async ({ page }) => {
    await page.goto('/editor/fake-conversion-id')
    const initialCount = await page.locator('[data-testid="slide-card"]').count()
    await page.getByRole('button', { name: /add slide/i }).first().click()
    const newCount = await page.locator('[data-testid="slide-card"]').count()
    expect(newCount).toBe(initialCount + 1)
  })
})
