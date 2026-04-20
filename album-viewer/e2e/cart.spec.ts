import { test, expect, type Page } from '@playwright/test'

const mockAlbums = [
  {
    id: 1,
    title: 'Dark Side of the Moon',
    artist: { name: 'Pink Floyd', birthdate: '1943-09-28', birthPlace: 'London' },
    price: 12.99,
    image_url: 'https://via.placeholder.com/300x300/667eea/white?text=Album+Cover',
  },
  {
    id: 2,
    title: 'Rumours',
    artist: { name: 'Fleetwood Mac', birthdate: '1948-07-03', birthPlace: 'London' },
    price: 10.99,
    image_url: 'https://via.placeholder.com/300x300/667eea/white?text=Album+Cover',
  },
]

async function setupMocks(page: Page) {
  await page.route('/albums', async (route) => {
    await route.fulfill({ json: mockAlbums })
  })
  await page.route('**/album-sales.json', async (route) => {
    await route.fulfill({ json: [] })
  })
}

test.describe('Cart Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page)
    await page.goto('/')
    // Wait for albums to load
    await page.waitForSelector('.albums-grid')
  })

  test('cart icon is visible in the header with initial count of 0', async ({ page }) => {
    const cartBtn = page.locator('.cart-btn')
    await expect(cartBtn).toBeVisible()
    await expect(page.locator('.cart-badge')).not.toBeVisible()
  })

  test('can add an album to the cart', async ({ page }) => {
    const firstAddBtn = page.locator('.album-card').first().locator('.btn-primary')
    await firstAddBtn.click()

    // Badge should now show 1
    const badge = page.locator('.cart-badge')
    await expect(badge).toBeVisible()
    await expect(badge).toHaveText('1')
  })

  test('add to cart button changes to in-cart state after adding', async ({ page }) => {
    const firstCard = page.locator('.album-card').first()
    const addBtn = firstCard.locator('.btn-primary')
    await addBtn.click()

    // Button should now show "in cart" state
    const inCartBtn = firstCard.locator('.btn-in-cart')
    await expect(inCartBtn).toBeVisible()
    await expect(inCartBtn).toBeDisabled()
  })

  test('cart badge updates when multiple albums are added', async ({ page }) => {
    const cards = page.locator('.album-card')

    // Add first album
    await cards.nth(0).locator('.btn-primary').click()
    await expect(page.locator('.cart-badge')).toHaveText('1')

    // Add second album
    await cards.nth(1).locator('.btn-primary').click()
    await expect(page.locator('.cart-badge')).toHaveText('2')
  })

  test('does not add duplicate albums', async ({ page }) => {
    const firstCard = page.locator('.album-card').first()
    await firstCard.locator('.btn-primary').click()

    // Button is now disabled, badge shows 1
    await expect(page.locator('.cart-badge')).toHaveText('1')
    await expect(firstCard.locator('.btn-in-cart')).toBeDisabled()
  })

  test('clicking cart icon opens the cart detail drawer', async ({ page }) => {
    await page.locator('.cart-btn').click()

    const drawer = page.locator('.cart-drawer')
    await expect(drawer).toBeVisible()
  })

  test('cart detail shows empty state when cart is empty', async ({ page }) => {
    await page.locator('.cart-btn').click()

    const emptyMsg = page.locator('.cart-empty')
    await expect(emptyMsg).toBeVisible()
  })

  test('cart detail shows added albums', async ({ page }) => {
    // Add an album
    await page.locator('.album-card').first().locator('.btn-primary').click()

    // Open cart
    await page.locator('.cart-btn').click()

    // Cart should show the album
    const cartItems = page.locator('.cart-item')
    await expect(cartItems).toHaveCount(1)
    await expect(page.locator('.cart-item-title').first()).toContainText('Dark Side of the Moon')
  })

  test('can remove an album from the cart detail', async ({ page }) => {
    // Add album then open cart
    await page.locator('.album-card').first().locator('.btn-primary').click()
    await page.locator('.cart-btn').click()

    // Remove the album
    await page.locator('.remove-btn').first().click()

    // Cart should now be empty
    await expect(page.locator('.cart-empty')).toBeVisible()
    await expect(page.locator('.cart-item')).toHaveCount(0)
  })

  test('removing album updates header badge count', async ({ page }) => {
    // Add two albums
    const cards = page.locator('.album-card')
    await cards.nth(0).locator('.btn-primary').click()
    await cards.nth(1).locator('.btn-primary').click()
    await expect(page.locator('.cart-badge')).toHaveText('2')

    // Open cart and remove one
    await page.locator('.cart-btn').click()
    await page.locator('.remove-btn').first().click()

    await expect(page.locator('.cart-badge')).toHaveText('1')
  })

  test('can close the cart drawer', async ({ page }) => {
    await page.locator('.cart-btn').click()
    await expect(page.locator('.cart-drawer')).toBeVisible()

    await page.locator('.close-btn').click()
    await expect(page.locator('.cart-drawer')).not.toBeVisible()
  })

  test('cart detail renders album title, artist, and price', async ({ page }) => {
    await page.locator('.album-card').first().locator('.btn-primary').click()
    await page.locator('.cart-btn').click()

    await expect(page.locator('.cart-item-title').first()).toContainText('Dark Side of the Moon')
    await expect(page.locator('.cart-item-artist').first()).toContainText('Pink Floyd')
    await expect(page.locator('.cart-item-price').first()).toContainText('12.99')
  })
})
