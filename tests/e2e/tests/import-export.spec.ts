import { test, expect } from '../fixtures/custom-fixtures';
import { createTestGroup } from '../fixtures/test-data';

test.describe('Export/Import', () => {
  test.beforeEach(async ({ page, dbHelpers }) => {
    await page.goto('/');
    await dbHelpers.clearDatabase();
    await page.reload();
  });

  test('should export data', async ({ page, addGroupModal, sidebar }) => {
    await addGroupModal.open();
    await addGroupModal.addGroup('Export Test');

    const download = await sidebar.exportData();
    expect(download.suggestedFilename()).toBe('vidary-videos.json');
  });

  test('should import data', async ({ page, sidebar, treeView }) => {
    const testData = JSON.stringify([createTestGroup({ name: 'Imported Group' })]);

    await sidebar.importData(testData);

    await expect(treeView.getItemByName('Imported Group')).toBeVisible();
  });
});
