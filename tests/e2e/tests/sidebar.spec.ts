import { test, expect } from '../fixtures/custom-fixtures';
import { TEXT_CONTENT } from '../config/test-constants';

test.describe('Sidebar Controls', () => {
  test.beforeEach(async ({ page, dbHelpers }) => {
    await page.goto('/');
    await dbHelpers.clearDatabase();
    await page.reload();
  });

  test('should hide sidebar', async ({ page, sidebar }) => {
    await expect(sidebar.title).toBeVisible();

    await sidebar.hide();

    await expect(sidebar.title).not.toBeVisible();
  });

  test('should show sidebar after hiding', async ({ page, sidebar }) => {
    await sidebar.hide();
    await expect(sidebar.title).not.toBeVisible();

    await sidebar.show();
    await expect(sidebar.title).toBeVisible();
  });

  test('should resize sidebar', async ({ page, sidebar, dbHelpers }) => {
    await sidebar.resize(400);

    const width = await dbHelpers.getSidebarWidth();
    expect(width).toBeGreaterThan(320);
  });

  test('should persist sidebar visibility', async ({ page, sidebar }) => {
    await sidebar.hide();

    await page.reload();

    await expect(sidebar.title).not.toBeVisible();
  });
});
