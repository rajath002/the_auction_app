import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByText('HomePlayersAuctionTeamsPlayer').click();
  await expect(page.getByText('KGF')).toBeVisible();
  await expect(page.getByText('Bhoomi Fighters')).toBeVisible();
  await expect(page.getByRole('heading')).toContainText('TEAMS AND PLAYERS');
});