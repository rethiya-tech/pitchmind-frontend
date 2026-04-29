import { test, expect } from '@playwright/test'


test.describe('Upload flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL ?? 'test@example.com')
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD ?? 'testpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/dashboard/)
  })

  test('upload page shows dropzone', async ({ page }) => {
    await page.goto('/upload')
    await expect(page.getByText(/drag.*drop|click to upload/i)).toBeVisible()
  })

  test('upload page shows theme picker', async ({ page }) => {
    await page.goto('/upload')
    await expect(page.getByText(/choose a theme/i)).toBeVisible()
  })

  test('upload page shows style and audience selectors', async ({ page }) => {
    await page.goto('/upload')
    await expect(page.getByLabel(/style/i)).toBeVisible()
    await expect(page.getByLabel(/audience/i)).toBeVisible()
  })

  test('upload page shows slide count selector', async ({ page }) => {
    await page.goto('/upload')
    await expect(page.getByLabel(/slide count|number of slides/i)).toBeVisible()
  })

  test('submit button is disabled without a file', async ({ page }) => {
    await page.goto('/upload')
    const button = page.getByRole('button', { name: /generate|create presentation/i })
    await expect(button).toBeDisabled()
  })

  test('unsupported file type shows error toast', async ({ page }) => {
    await page.goto('/upload')
    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="dropzone"]')
      if (!el) return
      const file = new File(['fake image data'], 'image.png', { type: 'image/png' })
      const dt = new DataTransfer()
      dt.items.add(file)
      el.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }))
    })
    await expect(page.getByText(/unsupported file type/i)).toBeVisible()
  })
})
