import { expect, test } from '@playwright/test'

test('browses artists and previews richer album metadata', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Artists' })).toBeVisible()
  const artistDirectory = page.locator('.artist-directory')
  await artistDirectory.getByRole('button', { name: /KEDA Club/ }).click()
  await expect(page.locator('.album-card')).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Scale It Up' })).toBeVisible()

  await page.getByRole('button', { name: 'Preview' }).click()
  const preview = page.getByRole('dialog', { name: 'Album preview' })
  await expect(preview).toBeVisible()
  await expect(preview.getByText('Artist created')).toBeVisible()
  await expect(preview.getByText('Autoscaling Electronica')).toBeVisible()
  await expect(preview.getByText('Album created')).toBeVisible()

  await preview.getByRole('button', { name: 'Close preview' }).click()
  await expect(preview).not.toBeVisible()

  await artistDirectory.getByRole('button', { name: 'All artists' }).click()
  await expect(page.locator('.album-card')).toHaveCount(6)
})