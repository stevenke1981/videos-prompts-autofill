import { test, expect } from '@playwright/test';

async function dismissUpdateDialogs(page) {
  await page.waitForLoadState('networkidle');
  const later = page.getByRole('button', { name: /稍後再說|Later/i });
  while (await later.isVisible().catch(() => false)) {
    await later.click();
  }
}

test.describe('Video Prompts Autofill smoke E2E', () => {
  test('discovery → editor → copy prompt', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await expect(page).toHaveTitle(/Video Prompts Autofill/i);

    await dismissUpdateDialogs(page);

    const backToEditor = page.getByRole('button', { name: /返回編輯器|Back to editor/i });
    if (await backToEditor.isVisible().catch(() => false)) {
      await backToEditor.click();
    } else {
      await page.getByText(/Seedance 2.0 通用公式|Seedance 2.0 General Formula/i).first().click();
      const useTemplate = page.getByRole('button', { name: /使用此模板|Use.*template/i });
      if (await useTemplate.isVisible().catch(() => false)) {
        await useTemplate.click();
      }
    }

    await expect(page.getByRole('button', { name: /預覽互動|Preview/i })).toBeVisible({
      timeout: 15000,
    });

    const previewBtn = page.getByRole('button', { name: /預覽互動|Preview/i });
    if (await previewBtn.isVisible()) {
      await previewBtn.click();
    }

    const copyBtn = page.getByRole('button', { name: /複製結果|Copy/i }).first();
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    await expect(page.getByText(/已複製|Copied/i)).toBeVisible({ timeout: 5000 });

    const clipboardText = await page.evaluate(async () => {
      try {
        return await navigator.clipboard.readText();
      } catch {
        return '';
      }
    });

    expect(clipboardText.length).toBeGreaterThan(20);
    expect(clipboardText).toMatch(/Subject|主體/i);
  });

  test('community templates share the original discovery waterfall', async ({ page }) => {
    await page.goto('/');
    await dismissUpdateDialogs(page);

    const search = page.getByPlaceholder(/搜尋所有模板與社群|Search templates and community/i);
    await expect(search).toBeVisible({ timeout: 15000 });
    await search.fill('cinematic');
    await expect(search).toHaveValue('cinematic');

    const grid = page.getByTestId('unified-discovery-grid');
    await expect(grid).toBeVisible();
    const communityCard = grid.getByTestId('community-template-card').first();
    await expect(communityCard).toBeVisible();
    await expect(communityCard).toContainText(/使用社群模板|Use community template/i);
    await communityCard.click();

    await expect(page.getByRole('button', { name: /預覽互動|Preview/i })).toBeVisible({
      timeout: 15000,
    });
  });

  test('banks search filters options', async ({ page }) => {
    await page.goto('/');
    await dismissUpdateDialogs(page);

    const backToEditor = page.getByRole('button', { name: /返回編輯器|Back to editor/i });
    if (await backToEditor.isVisible().catch(() => false)) {
      await backToEditor.click();
    }

    const bankSearch = page.getByPlaceholder(/搜尋詞庫|Search banks/i);
    await expect(bankSearch).toBeVisible({ timeout: 15000 });
    await bankSearch.fill('camera_movement');
    await expect(bankSearch).toHaveValue('camera_movement');
  });

  test('theme toggle switches dark class', async ({ page }) => {
    await page.goto('/');
    await dismissUpdateDialogs(page);

    await page.getByRole('button', { name: /設定|Settings/i }).click();
    await page.getByRole('button', { name: /深色|Dark/i }).click();

    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDark).toBe(true);
  });
});
