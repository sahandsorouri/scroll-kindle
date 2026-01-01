import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h1')).toContainText('QuoteScroll')
    await expect(page.locator('text=Scroll your own highlights')).toBeVisible()
  })

  test('should have Try Demo and Connect Readwise buttons', async ({ page }) => {
    await page.goto('/')

    const demoButton = page.locator('button:has-text("Try Demo")')
    const connectButton = page.locator('a:has-text("Connect Readwise")')

    await expect(demoButton).toBeVisible()
    await expect(connectButton).toBeVisible()
  })

  test('should navigate to feed in demo mode', async ({ page }) => {
    await page.goto('/')

    const demoButton = page.locator('button:has-text("Try Demo")')
    await demoButton.click()

    await expect(page).toHaveURL(/\/feed\?demo=true/)
  })

  test('should navigate to connect page', async ({ page }) => {
    await page.goto('/')

    const connectButton = page.locator('a:has-text("Connect Readwise")')
    await connectButton.click()

    await expect(page).toHaveURL('/connect')
  })

  test('should display privacy notice', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('text=Privacy First')).toBeVisible()
    await expect(page.locator('text=Token stored locally')).toBeVisible()
  })
})

