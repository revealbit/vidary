import { test, expect } from '../fixtures/custom-fixtures';
import { TEST_URLS } from '../config/test-constants';

test.describe('Drag and Drop', () => {
  test.beforeEach(async ({ page, dbHelpers }) => {
    await page.goto('/');
    await dbHelpers.clearDatabase();
    await page.reload();
  });

  test('should move video into group by dragging', async ({ page, addGroupModal, addVideoModal, treeView }) => {
    await addGroupModal.open();
    await addGroupModal.addGroup('Target Group');

    await addVideoModal.open();
    await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Draggable Video');

    await treeView.dragItemToTarget('Draggable Video', 'Target Group');

    await treeView.clickItem('Target Group');
    await expect(treeView.getItemByName('Draggable Video')).not.toBeVisible();

    await treeView.clickItem('Target Group');
    await expect(treeView.getItemByName('Draggable Video')).toBeVisible();
  });

  test('should reorder videos within same level', async ({ page, addVideoModal, treeView }) => {
    await addVideoModal.open();
    await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Video A');

    await addVideoModal.open();
    await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Video B');

    const firstItemBefore = await treeView.getFirstItemText();
    expect(firstItemBefore).toBe('Video A');

    await treeView.dragItemToTarget('Video B', 'Video A');

    const firstItemAfter = await treeView.getFirstItemText();
    expect(firstItemAfter).toBe('Video B');
  });

  test('should move video out of group to root', async ({ page, addGroupModal, addVideoModal, treeView }) => {
    await addGroupModal.open();
    await addGroupModal.addGroup('Source Group');

    await addVideoModal.open();
    await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Nested Video', {
      group: 'Source Group'
    });

    await addVideoModal.open();
    await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Root Video');

    await treeView.dragItemToTarget('Nested Video', 'Root Video');

    await treeView.clickItem('Source Group');
    await expect(treeView.getItemByName('Nested Video')).toBeVisible();
  });

  test('should not allow dropping group into itself', async ({ page, addGroupModal, treeView }) => {
    await addGroupModal.open();
    await addGroupModal.addGroup('Self Group');

    await treeView.dragItemToTarget('Self Group', 'Self Group');

    await expect(treeView.getItemByName('Self Group')).toBeVisible();
  });
});
