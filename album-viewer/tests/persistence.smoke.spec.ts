import { expect, test } from '@playwright/test'
import { AlbumAppPage } from './helpers/album-app-page'

test.describe('album viewer persistence', () => {
  test('persists cart contents across reload and lets the user remove restored items', async ({ page }) => {
    const app = new AlbumAppPage(page)

    await app.goto()
    await app.addFirstAlbumToCart()
    await app.expectCartCount(1)
    await app.closeCart()

    await page.reload()
    await app.expectLoaded()
    await app.expectCartCount(1)
    await expect(app.firstAlbumCard.getByText('1 in cart')).toBeVisible()

    await app.openCart()
    await expect(app.cartDialog.getByRole('heading', { name: 'You, Me and an App Id' })).toBeVisible()

    await app.cartDialog.locator('.remove-button').click()
    await app.expectCartCount(0)
    await expect(app.cartDialog.getByText('Your cart is empty.')).toBeVisible()
  })

  test('persists the selected locale across reloads', async ({ page }) => {
    const app = new AlbumAppPage(page)

    await app.goto()
    await app.selectLocale('fr')
    await expect(page.getByText('Collection d\'albums')).toBeVisible()
    await expect(page.locator('.price').first()).toHaveText('10,99\u00a0$US')

    await page.reload()
    await app.expectLoaded()
    await expect(page.getByText('Collection d\'albums')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ajouter au panier' }).first()).toBeVisible()
    await expect(page.locator('.price').first()).toHaveText('10,99\u00a0$US')
    await expect(app.languageSelector).toHaveValue('fr')
  })

  test('persists the selected theme across reloads', async ({ page }) => {
    const app = new AlbumAppPage(page)

    await app.goto()
    await expect(app.rootTheme).toHaveAttribute('data-theme', 'default')

    await app.selectTheme('dark')
    await expect(app.rootTheme).toHaveAttribute('data-theme', 'dark')
    await expect(app.themeSelector).toHaveValue('dark')

    await page.reload()
    await app.expectLoaded()
    await expect(app.rootTheme).toHaveAttribute('data-theme', 'dark')
    await expect(app.themeSelector).toHaveValue('dark')
  })
})