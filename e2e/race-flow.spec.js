import { expect, test } from '@playwright/test'

test('generate schedule, start race and stop manually', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Horse Racing Game' })).toBeVisible()

  await page.getByRole('button', { name: 'Generate' }).click()

  await expect(page.locator('.schedule-card')).toHaveCount(6)
  await expect(page.getByText('Lap 6')).toBeVisible()
  await expect(page.getByText('2200m')).toBeVisible()

  await page.getByRole('button', { name: 'Start' }).click()

  await page.getByRole('button', { name: 'Results' }).click()
  await expect(page.locator('.result-card')).toHaveCount(1, { timeout: 30_000 })
  await expect(page.locator('.result-card').first().locator('li')).toHaveCount(10)

  await page.getByRole('button', { name: 'Stop' }).click()
  await expect(page.getByRole('button', { name: 'Stop' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled()
})
