import { test, expect } from '../fixtures/custom-fixtures';
import { TEST_URLS, TEXT_CONTENT } from '../config/test-constants';

test.describe('Video Management', () => {
  test.beforeEach(async ({ page, dbHelpers }) => {
    await page.goto('/');
    await dbHelpers.clearDatabase();
    await page.reload();
  });

  test.describe('Add Video', () => {
    test('should open add video modal', async ({ page, addVideoModal }) => {
      await addVideoModal.open();
      await expect(addVideoModal.heading).toBeVisible();
      await expect(addVideoModal.urlInput).toBeVisible();
    });

    test('should add video with standard YouTube URL', async ({ page, addVideoModal, treeView }) => {
      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Test Video');

      await expect(treeView.getItemByName('Test Video')).toBeVisible();
    });

    test('should add video with YouTube Shorts URL', async ({ page, addVideoModal, treeView }) => {
      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_SHORT, 'Test Shorts');

      await expect(treeView.getItemByName('Test Shorts')).toBeVisible();
    });

    test('should show error for invalid URL', async ({ page, addVideoModal }) => {
      await addVideoModal.open();
      await addVideoModal.urlInput.fill(TEST_URLS.INVALID_URL);
      await addVideoModal.titleInput.fill('Test');
      await addVideoModal.addButton.click();

      await expect(page.getByText(TEXT_CONTENT.ERROR_INVALID_URL)).toBeVisible();
    });

    test('should close modal on cancel', async ({ page, addVideoModal }) => {
      await addVideoModal.open();
      await addVideoModal.cancel();

      await expect(addVideoModal.heading).not.toBeVisible();
    });

    test('should add video with status and description', async ({ page, addVideoModal }) => {
      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Status Test Video', {
        status: 'important',
        description: 'This is an important video for learning'
      });

      await expect(page.locator('svg.lucide-star')).toBeVisible();
    });
  });

  test.describe('Edit Video', () => {
    test('should edit video using modal', async ({ page, addVideoModal, treeView, editVideoModal }) => {
      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Original Name');

      await treeView.editItem('Original Name');
      await expect(editVideoModal.heading).toBeVisible();
      await expect(editVideoModal.urlInput).toHaveValue(TEST_URLS.SAMPLE_VIDEO);

      await editVideoModal.updateTitle('New Name');

      await expect(treeView.getItemByName('New Name')).toBeVisible();
      await expect(treeView.getItemByName('Original Name')).not.toBeVisible();
    });

    test('should edit video URL in modal', async ({ page, addVideoModal, treeView, editVideoModal, videoPlayer }) => {
      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Test Video');

      await treeView.editItem('Test Video');
      await editVideoModal.updateUrl('https://www.youtube.com/watch?v=abcdefghijk');

      await treeView.clickItem('Test Video');
      await expect(videoPlayer.iframe).toHaveAttribute('src', /youtube\.com\/embed\/abcdefghijk/);
    });

    test('should change video group in edit modal', async ({ page, addVideoModal, addGroupModal, treeView, editVideoModal }) => {
      await addGroupModal.open();
      await addGroupModal.addGroup('Target Group');

      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Move Video');

      await treeView.editItem('Move Video');
      await editVideoModal.groupSelect.selectOption({ label: 'Target Group' });
      await editVideoModal.saveButton.click();

      await treeView.clickItem('Target Group');
      await expect(treeView.getItemByName('Move Video')).not.toBeVisible();

      await treeView.clickItem('Target Group');
      await expect(treeView.getItemByName('Move Video')).toBeVisible();
    });

    test('should refresh title from YouTube in edit modal', async ({ page, addVideoModal, treeView, editVideoModal }) => {
      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Custom Title');

      await treeView.editItem('Custom Title');
      await editVideoModal.refreshTitleFromYouTube();

      const newTitle = await editVideoModal.titleInput.inputValue();
      expect(newTitle).not.toBe('Custom Title');
    });
  });

  test.describe('Delete Video', () => {
    test('should delete video', async ({ page, addVideoModal, treeView }) => {
      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'To Delete');

      page.on('dialog', dialog => dialog.accept());
      await treeView.deleteItem('To Delete');

      await expect(treeView.getItemByName('To Delete')).not.toBeVisible();
    });
  });

  test.describe('Video Status', () => {
    test('should edit video status', async ({ page, addVideoModal, treeView, editVideoModal }) => {
      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Edit Status Video');

      await treeView.editItem('Edit Status Video');
      await editVideoModal.updateStatus('watched');

      await expect(page.getByTitle('Mark as unwatched')).toBeVisible();
    });

    test('should toggle watched status with one click', async ({ page, addVideoModal }) => {
      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Toggle Test Video');

      const toggleButton = page.getByTitle('Mark as watched');
      await expect(toggleButton).toBeVisible();

      await toggleButton.click();
      await expect(page.getByTitle('Mark as unwatched')).toBeVisible();

      await page.getByTitle('Mark as unwatched').click();
      await expect(page.getByTitle('Mark as watched')).toBeVisible();
    });
  });

  test.describe('Video Description', () => {
    test('should display description in video player footer', async ({ page, addVideoModal, treeView }) => {
      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Description Test', {
        description: 'Test video description'
      });

      await treeView.clickItem('Description Test');

      await expect(page.getByText('Test video description')).toBeVisible();
    });

    test('should update description in edit modal', async ({ page, addVideoModal, treeView, editVideoModal }) => {
      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Update Desc Video', {
        description: 'Old description'
      });

      await treeView.editItem('Update Desc Video');
      await editVideoModal.updateDescription('New updated description');

      await treeView.clickItem('Update Desc Video');
      await expect(page.getByText('New updated description')).toBeVisible();
    });
  });
});
