import { test, expect } from '@playwright/test'

test.describe('Books Page', () => {
  test.beforeEach(async ({ page }) => {
    // Setup demo mode
    await page.goto('/')
    await page.click('button:has-text("Try Demo")')
    await page.waitForURL(/\/feed/)
    
    // Navigate to books
    await page.click('button:has-text("Settings")')
    await page.click('text=View All Books')
    await page.waitForURL('/books')
  })

  test('should display books grid', async ({ page }) => {
    await expect(page.locator('h1:has-text("Your Books")')).toBeVisible()
    
    // Should show at least one book
    await expect(page.locator('text=Atomic Habits')).toBeVisible()
  })

  test('should filter books by search', async ({ page }) => {
    // Type in search box
    await page.fill('input[placeholder*="Search"]', 'Deep Work')
    
    // Should show only Deep Work
    await expect(page.locator('text=Deep Work')).toBeVisible()
    await expect(page.locator('text=Atomic Habits')).not.toBeVisible()
  })

  test('should navigate to book detail page', async ({ page }) => {
    // Click on a book
    await page.click('text=Atomic Habits')
    
    // Should navigate to book detail
    await expect(page).toHaveURL(/\/books\/\d+/)
    await expect(page.locator('h1:has-text("Atomic Habits")')).toBeVisible()
  })

  test('should show book details and highlights', async ({ page }) => {
    await page.click('text=Atomic Habits')
    
    // Should show book info
    await expect(page.locator('text=James Clear')).toBeVisible()
    
    // Should show highlights section
    await expect(page.locator('text=/Highlights \\(\\d+\\)/')).toBeVisible()
    
    // Should show at least one highlight
    await expect(page.locator('blockquote').first()).toBeVisible()
  })

  test('should navigate to filtered feed from book page', async ({ page }) => {
    await page.click('text=Atomic Habits')
    
    // Click "Start Scrolling This Book"
    await page.click('text=Start Scrolling This Book')
    
    // Should navigate to feed with bookId filter
    await expect(page).toHaveURL(/\/feed\?bookId=\d+/)
  })
})

