import { expect, type Locator, type Page } from '@playwright/test'

export class AlbumAppPage {
  constructor(private readonly page: Page) {}

  get cartButton(): Locator {
    return this.page.locator('.cart-button')
  }

  get cartBadge(): Locator {
    return this.cartButton.locator('.cart-badge')
  }

  get cartDialog(): Locator {
    return this.page.getByRole('dialog')
  }

  get cartSummary(): Locator {
    return this.cartDialog.locator('.cart-summary')
  }

  get languageSelector(): Locator {
    return this.page.locator('.language-selector select')
  }

  get themeSelector(): Locator {
    return this.page.locator('.theme-selector select')
  }

  get firstAlbumCard(): Locator {
    return this.page.locator('.album-card').first()
  }

  get rootTheme(): Locator {
    return this.page.locator('html')
  }

  async goto(): Promise<void> {
    await this.page.goto('/')
    await this.expectLoaded()
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(this.page.locator('.album-card')).toHaveCount(6)
    await expect(this.firstAlbumCard).toBeVisible()
    await expect(this.cartButton).toBeVisible()
  }

  async expectCartCount(count: number): Promise<void> {
    await expect(this.cartBadge).toHaveText(String(count))
    await expect(this.cartButton).toHaveAttribute('aria-label', new RegExp(String(count)))
  }

  async addFirstAlbumToCart(): Promise<void> {
    await this.firstAlbumCard.locator('.btn-primary').click()
  }

  async openCart(): Promise<void> {
    await this.cartButton.click()
    await expect(this.cartDialog).toBeVisible()
  }

  async closeCart(): Promise<void> {
    await this.cartDialog.locator('.close-button').click()
    await expect(this.cartDialog).not.toBeVisible()
  }

  async selectLocale(locale: 'en' | 'fr' | 'de'): Promise<void> {
    await this.languageSelector.selectOption(locale)
  }

  async selectTheme(value: 'default' | 'dark'): Promise<void> {
    await this.themeSelector.selectOption(value)
  }

  async expectTheme(value: 'default' | 'dark'): Promise<void> {
    await expect(this.rootTheme).toHaveAttribute('data-theme', value)
    await expect(this.themeSelector).toHaveValue(value)
  }
}