import { test, expect } from '@playwright/test'


test.describe('Admin pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(process.env.TEST_ADMIN_EMAIL ?? 'admin@example.com')
    await page.getByLabel(/password/i).fill(process.env.TEST_ADMIN_PASSWORD ?? 'adminpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/dashboard/)
  })

  test('admin dashboard shows metrics', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByText(/total users|total conversions/i)).toBeVisible()
  })

  test('admin users page shows user table', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('admin users page has pagination', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page.getByRole('navigation', { name: /pagination/i })).toBeVisible()
  })

  test('admin audit log page shows log entries', async ({ page }) => {
    await page.goto('/admin/audit-log')
    await expect(page.getByText(/audit log/i)).toBeVisible()
  })

  test('non-admin user redirected from admin pages', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL ?? 'test@example.com')
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD ?? 'testpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/dashboard/)
    await page.goto('/admin')
    await expect(page).toHaveURL(/dashboard|forbidden/)
  })
})
