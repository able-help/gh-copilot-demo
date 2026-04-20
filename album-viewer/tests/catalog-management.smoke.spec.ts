import { expect, test } from '@playwright/test'

test('creates, updates, and deletes an album from the management panel', async ({ page }) => {
  await page.goto('/')
  const managerPanel = page.locator('.manager-panel')

  await expect(page.getByRole('heading', { name: 'Catalog Studio' })).toBeVisible()

  await managerPanel.getByLabel('Album title').fill('Integration Echoes')
  await managerPanel.getByLabel('Artist').selectOption({ label: 'KEDA Club' })
  await managerPanel.getByLabel('Price').fill('18.25')
  await managerPanel.getByLabel('Release date').fill('2030-07-01')
  await managerPanel.getByLabel('Image URL').fill('https://example.com/integration-echoes.png')
  await managerPanel.getByRole('button', { name: 'Create album' }).click()

  await expect(page.getByText('Album created successfully.')).toBeVisible()
  const createdCard = page.locator('.album-card').filter({ has: page.getByRole('heading', { name: 'Integration Echoes' }) })
  await expect(createdCard).toBeVisible()
  await expect(createdCard.getByText('Genre: Autoscaling Electronica')).toBeVisible()

  await createdCard.getByRole('button', { name: 'Edit album' }).click()
  await expect(page.getByText('Editing selected album')).toBeVisible()
  await managerPanel.getByLabel('Artist').selectOption({ label: 'Daprize' })
  await managerPanel.getByLabel('Price').fill('19.50')
  await managerPanel.getByRole('button', { name: 'Update album' }).click()

  await expect(page.getByText('Album updated successfully.')).toBeVisible()
  await expect(createdCard.getByText('Genre: Cloud Native Pop')).toBeVisible()
  await expect(createdCard.getByText('$19.50')).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await createdCard.getByRole('button', { name: 'Delete album' }).click()

  await expect(page.getByText('Album deleted successfully.')).toBeVisible()
  await expect(createdCard).toHaveCount(0)
})