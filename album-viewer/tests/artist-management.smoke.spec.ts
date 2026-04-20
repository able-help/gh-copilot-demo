import { expect, test } from '@playwright/test'

test('creates, updates, and deletes an artist from the management panel', async ({ page }) => {
  await page.goto('/')
  const artistPanel = page.locator('.artist-panel')

  await expect(page.getByRole('heading', { name: 'Artist Studio' })).toBeVisible()

  await artistPanel.getByLabel('Artist name').fill('Release Notes')
  await artistPanel.getByLabel('Artist genre').fill('Docs Rock')
  await artistPanel.getByRole('button', { name: 'Create artist' }).click()

  await expect(page.getByText('Artist created successfully.')).toBeVisible()
  const createdArtist = artistPanel.locator('.artist-list-item').filter({ hasText: 'Release Notes' })
  await expect(createdArtist).toBeVisible()
  await expect(page.locator('.manager-panel').getByLabel('Artist').locator('option:checked')).toHaveText('Release Notes')

  await createdArtist.click()
  await expect(page.getByText('Editing selected artist')).toBeVisible()
  await artistPanel.getByLabel('Artist genre').fill('Docs Synth')
  await artistPanel.getByRole('button', { name: 'Update artist' }).click()

  await expect(page.getByText('Artist updated successfully.')).toBeVisible()
  await expect(artistPanel.locator('.artist-list-item').filter({ hasText: 'Release Notes' })).toContainText('Docs Synth')

  await artistPanel.locator('.artist-list-item').filter({ hasText: 'Release Notes' }).click()
  page.once('dialog', (dialog) => dialog.accept())
  await artistPanel.getByRole('button', { name: 'Delete artist' }).click()

  await expect(page.getByText('Artist deleted successfully.')).toBeVisible()
  await expect(artistPanel.locator('.artist-list-item').filter({ hasText: 'Release Notes' })).toHaveCount(0)
})