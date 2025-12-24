import { test, expect } from '../fixtures/custom-fixtures';
import { TEST_URLS, TIMEOUTS } from '../config/test-constants';

test.describe('Data Persistence', () => {
  test.beforeEach(async ({ page, dbHelpers }) => {
    await page.goto('/');
    await dbHelpers.clearDatabase();
    await page.reload();
  });

  test('should persist videos after reload', async ({ page, addVideoModal, treeView }) => {
    await addVideoModal.open();
    await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Persistent Video');

    await expect(treeView.getItemByName('Persistent Video')).toBeVisible();

    await page.reload();

    await expect(treeView.getItemByName('Persistent Video')).toBeVisible();
  });

  test('should persist groups after reload', async ({ page, addGroupModal, treeView }) => {
    await addGroupModal.open();
    await addGroupModal.addGroup('Persistent Group');

    await expect(treeView.getItemByName('Persistent Group')).toBeVisible();

    await page.reload();

    await page.waitForTimeout(TIMEOUTS.DB_LOAD);
    await expect(treeView.getItemByName('Persistent Group')).toBeVisible();
  });
});
