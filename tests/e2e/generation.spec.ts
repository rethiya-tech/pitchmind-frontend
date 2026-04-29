import { test, expect } from '@playwright/test'


test.describe('Generation page', () => {
  test('generation page shows progress indicator', async ({ page }) => {
    await page.goto('/generating/fake-conversion-id')
    await expect(page.getByRole('progressbar')).toBeVisible()
  })

  test('generation page shows slide count progress text', async ({ page }) => {
    await page.goto('/generating/fake-conversion-id')
    await expect(page.getByText(/generating|processing/i)).toBeVisible()
  })

  test('generation page has cancel button', async ({ page }) => {
    await page.goto('/generating/fake-conversion-id')
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()
  })

  test('generation page shows error state on stream failure', async ({ page }) => {
    await page.route('**/api/v1/conversions/*/stream**', route => {
      route.fulfill({
        status: 500,
        body: 'event: error\ndata: {"message":"Server error"}\n\n',
      })
    })
    await page.goto('/generating/fake-conversion-id')
    await expect(page.getByText(/error|failed/i)).toBeVisible({ timeout: 5000 })
  })
})
