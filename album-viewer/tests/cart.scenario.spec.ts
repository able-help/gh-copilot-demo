import { expect, test } from '@playwright/test'
import { AlbumAppPage } from './helpers/album-app-page'

test('adds the first album to the cart and captures the cart state', async ({ page }, testInfo) => {
  const app = new AlbumAppPage(page)
  const firstAlbumCard = app.firstAlbumCard
  const cartDialog = app.cartDialog
  const cartSummary = app.cartSummary

  await test.step('Open the album app', async () => {
    await app.goto()
    await app.expectCartCount(0)
    await app.expectTheme('default')
    await app.selectTheme('dark')
    await app.expectTheme('dark')
  })

  await test.step('Click Add to Cart on the first tile', async () => {
    await app.addFirstAlbumToCart()

    await app.expectCartCount(1)
    await expect(firstAlbumCard.getByText('1 in cart')).toBeVisible()
  })

  await test.step('Use the cart button in the header to display the cart', async () => {
    if (await cartDialog.isVisible()) {
      await app.closeCart()
    }

    await app.openCart()
    await expect(cartDialog.getByText('1 item(s) in your cart')).toBeVisible()
  })

  await test.step('Check that the cart contains the added album', async () => {
    await expect(cartDialog.getByRole('heading', { name: 'You, Me and an App Id' })).toBeVisible()
    await expect(cartDialog.getByText('Daprize')).toBeVisible()
    await expect(cartDialog.getByText('Subtotal: $10.99')).toBeVisible()
  })

  await test.step('Cover the additional cart features', async () => {
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
    await expect(cartDialog.getByText('2 item(s) in your cart')).toBeVisible()
    await expect(cartSummary.getByText('$21.98', { exact: true })).toBeVisible()
    await expect(cartSummary.getByText('$1.76', { exact: true })).toBeVisible()
    await expect(cartSummary.getByText('$28.73', { exact: true })).toBeVisible()
  })

  await test.step('Take a screenshot of the cart', async () => {
    const screenshotPath = testInfo.outputPath('cart-drawer.png')
    await cartDialog.screenshot({ path: screenshotPath })
    await testInfo.attach('cart-drawer', {
      path: screenshotPath,
      contentType: 'image/png'
    })
  })
})