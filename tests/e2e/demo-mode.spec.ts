import { test, expect } from '@playwright/test'

test.describe('Demo Mode', () => {
  test('should load demo highlights in feed', async ({ page }) => {
    await page.goto('/')
    
    // Click Try Demo
    await page.click('button:has-text("Try Demo")')
    
    // Wait for navigation to feed
    await page.waitForURL(/\/feed\?demo=true/)
    
    // Should show a highlight
    await expect(page.locator('blockquote')).toBeVisible()
  })

  test('should navigate between highlights with keyboard', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Try Demo")')
    await page.waitForURL(/\/feed\?demo=true/)

    // Get initial highlight text
    const firstHighlight = await page.locator('blockquote').textContent()

    // Press down arrow
    await page.keyboard.press('ArrowDown')
    
    // Wait a bit for transition
    await page.waitForTimeout(500)

    // Get new highlight text
    const secondHighlight = await page.locator('blockquote').textContent()

    // They should be different
    expect(firstHighlight).not.toBe(secondHighlight)
  })

  test('should show highlight counter', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Try Demo")')
    await page.waitForURL(/\/feed\?demo=true/)

    // Should show counter like "1 / 15"
    await expect(page.locator('text=/\\d+ \\/ \\d+/')).toBeVisible()
  })

  test('should show book information', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Try Demo")')
    await page.waitForURL(/\/feed\?demo=true/)

    // Should show book title
    await expect(page.locator('text=Atomic Habits')).toBeVisible()
  })

  test('should open filters modal', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Try Demo")')
    await page.waitForURL(/\/feed\?demo=true/)

    // Click Filters button
    await page.click('button:has-text("Filters")')

    // Should show filters modal
    await expect(page.locator('text=Search')).toBeVisible()
    await expect(page.locator('text=Filter by Book')).toBeVisible()
  })

  test('should navigate to books page', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Try Demo")')
    await page.waitForURL(/\/feed\?demo=true/)

    // Open settings
    await page.click('button:has-text("Settings")')
    
    // Click View All Books
    await page.click('text=View All Books')

    // Should navigate to books page
    await expect(page).toHaveURL('/books')
    await expect(page.locator('h1:has-text("Your Books")')).toBeVisible()
  })
})

