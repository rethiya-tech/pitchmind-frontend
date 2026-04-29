import { test, expect } from '@playwright/test'


test.describe('Authentication', () => {
  test('login page renders email and password fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('login page has submit button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('login with empty fields shows validation error', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/required|enter your email/i)).toBeVisible()
  })

  test('login with wrong credentials shows error message', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid email or password/i)).toBeVisible()
  })

  test('register page has all required fields', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByLabel(/name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/^password$/i)).toBeVisible()
  })

  test('register with mismatched passwords shows error', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel(/name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/^password$/i).fill('Password123!')
    await page.getByLabel(/confirm password/i).fill('DifferentPass!')
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })

  test('login page link navigates to register', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /register/i }).click()
    await expect(page).toHaveURL(/register/)
  })

  test('register page link navigates to login', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('link', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/login/)
  })

  test('unauthenticated access to dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/)
  })
})
