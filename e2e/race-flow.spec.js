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

test('supports re-generating while race is active', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Generate' }).click()
  await page.getByRole('button', { name: 'Start' }).click()

  await page.waitForTimeout(1200)
  await page.getByRole('button', { name: 'Generate' }).click()

  await expect(page.getByText('Click Generate, then Start.')).toBeVisible()
  await expect(page.locator('.schedule-card')).toHaveCount(6)
  await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled()
})

test('highlights winner after round finishes', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Generate' }).click()
  await page.getByRole('button', { name: 'Start' }).click()

  await expect(page.locator('.next-race-label')).toBeVisible({ timeout: 35_000 })
  await expect(page.locator('.lane-winner')).toHaveCount(1)
  await expect(page.locator('.lane-track-winner')).toHaveCount(1)
})

test('completes all six rounds', async ({ page }) => {
  test.setTimeout(240_000)

  await page.goto('/')

  await page.getByRole('button', { name: 'Generate' }).click()
  await page.getByRole('button', { name: 'Start' }).click()
  await page.getByRole('button', { name: 'Results' }).click()

  await expect(page.locator('.result-card')).toHaveCount(6, { timeout: 220_000 })
})
