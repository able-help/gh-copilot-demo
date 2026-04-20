import { expect, test } from '@playwright/test'
import { AlbumAppPage } from './helpers/album-app-page'

test('renders albums from album-api-v2', async ({ page }) => {
  const app = new AlbumAppPage(page)

  await app.goto()

  await expect(app.rootTheme).toHaveAttribute('data-theme', 'default')
  await expect(page.getByRole('heading', { name: '🎵 Album Collection' })).toBeVisible()
  await expect(page.getByText('Discover amazing music albums')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'You, Me and an App Id' })).toBeVisible()
  await expect(page.locator('.album-card')).toHaveCount(6)
  await expect(page.locator('.album-artist').first()).toContainText('Daprize')
  await expect(page.locator('.price').first()).toHaveText('$10.99')

  await app.selectLocale('fr')
  await expect(page.getByText('Langue')).toBeVisible()
  await expect(page.getByText('Collection d\'albums')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ajouter au panier' }).first()).toBeVisible()
  await expect(page.locator('.price').first()).toHaveText('10,99\u00a0$US')

  await app.selectLocale('de')
  await expect(page.getByText('Sprache')).toBeVisible()
  await expect(page.getByText('Albumsammlung')).toBeVisible()
  await expect(page.getByRole('button', { name: 'In den Warenkorb' }).first()).toBeVisible()
  await expect(page.locator('.price').first()).toHaveText('10,99\u00a0$')
})

test('manages cart contents from the album list', async ({ page }) => {
  const app = new AlbumAppPage(page)

  await app.goto()
  await app.expectCartCount(0)

  await app.addFirstAlbumToCart()
  await app.expectCartCount(1)
  const cartDialog = app.cartDialog
  const cartSummary = app.cartSummary
  await expect(cartDialog).toBeVisible()
  await expect(page.getByText('1 item(s) in your cart')).toBeVisible()
  await expect(cartDialog.getByRole('heading', { name: 'You, Me and an App Id' })).toBeVisible()
  await expect(page.getByText('1 in cart')).toBeVisible()
  await expect(cartDialog.getByText('Subtotal: $10.99')).toBeVisible()
  await expect(cartSummary.getByText('Items subtotal')).toBeVisible()
  await expect(cartSummary.getByText('$10.99', { exact: true })).toBeVisible()
  await expect(cartSummary.getByText('Estimated tax')).toBeVisible()
  await expect(cartSummary.getByText('$0.88', { exact: true })).toBeVisible()
  await expect(cartSummary.getByText('Shipping')).toBeVisible()
  await expect(cartSummary.getByText('$4.99', { exact: true })).toBeVisible()
  await expect(cartSummary.getByText('Order total', { exact: true })).toBeVisible()
  await expect(cartSummary.getByText('$16.86', { exact: true })).toBeVisible()

  await cartDialog.getByRole('button', { name: 'Increase quantity' }).click()
  await app.expectCartCount(2)
  await expect(page.getByText('2 item(s) in your cart')).toBeVisible()
  await expect(page.getByText('2 in cart')).toBeVisible()
  await expect(cartDialog.getByText('Subtotal: $21.98')).toBeVisible()
  await expect(cartSummary.getByText('$21.98', { exact: true })).toBeVisible()
  await expect(cartSummary.getByText('$1.76', { exact: true })).toBeVisible()
  await expect(cartSummary.getByText('$28.73', { exact: true })).toBeVisible()

  await cartDialog.getByRole('button', { name: 'Decrease quantity' }).click()
  await app.expectCartCount(1)
  await expect(page.getByText('1 item(s) in your cart')).toBeVisible()

  await cartDialog.getByRole('button', { name: 'Clear cart' }).click()
  await app.expectCartCount(0)
  await expect(page.getByText('Your cart is empty.')).toBeVisible()
})