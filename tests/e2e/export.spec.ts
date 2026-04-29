import { test, expect } from '@playwright/test'


test.describe('Export page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL ?? 'test@example.com')
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD ?? 'testpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/dashboard/)
  })

  test('export page shows selected theme name', async ({ page }) => {
    await page.goto('/export/fake-conversion-id')
    await expect(page.getByText(/executive|corporate|digital|nordic|midnight|gold/i)).toBeVisible()
  })

  test('export page shows download button', async ({ page }) => {
    await page.goto('/export/fake-conversion-id')
    await expect(page.getByRole('button', { name: /download/i })).toBeVisible()
  })

  test('export page shows slide count summary', async ({ page }) => {
    await page.goto('/export/fake-conversion-id')
    await expect(page.getByText(/slide/i)).toBeVisible()
  })

  test('download button triggers export and shows loading state', async ({ page }) => {
    await page.route('**/api/v1/conversions/*/export', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ download_url: 'https://storage.googleapis.com/fake.pptx' }),
      })
    })
    await page.goto('/export/fake-conversion-id')
    const downloadBtn = page.getByRole('button', { name: /download/i })
    await downloadBtn.click()
    await expect(page.getByText(/preparing|generating|downloading/i)).toBeVisible({ timeout: 2000 })
  })

  test('export page has back to editor link', async ({ page }) => {
    await page.goto('/export/fake-conversion-id')
    await expect(page.getByRole('link', { name: /back|editor/i })).toBeVisible()
  })
})
