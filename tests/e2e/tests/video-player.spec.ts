import { test, expect } from '../fixtures/custom-fixtures';
import { TEST_URLS, TEXT_CONTENT } from '../config/test-constants';

test.describe('Video Player', () => {
  test.beforeEach(async ({ page, dbHelpers }) => {
    await page.goto('/');
    await dbHelpers.clearDatabase();
    await page.reload();
  });

  test.describe('Initial State', () => {
    test('should display empty state message', async ({ page, videoPlayer, treeView }) => {
      await expect(videoPlayer.emptyStateMessage).toBeVisible();
      await expect(treeView.emptyMessage).toBeVisible();
    });

    test('should display sidebar with title', async ({ page, sidebar }) => {
      await expect(sidebar.title).toBeVisible();
    });

    test('should display add buttons', async ({ page, sidebar }) => {
      await expect(sidebar.addVideoButton).toBeVisible();
      await expect(sidebar.addGroupButton).toBeVisible();
    });
  });

  test.describe('Video Playback', () => {
    test('should display video when selected', async ({ page, addVideoModal, treeView, videoPlayer }) => {
      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Test Video');

      await treeView.clickItem('Test Video');

      await expect(videoPlayer.iframe).toBeVisible();
      await expect(videoPlayer.iframe).toHaveAttribute('src', /youtube\.com\/embed\/dQw4w9WgXcQ/);
    });

    test('should display video title below player', async ({ page, addVideoModal, treeView }) => {
      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'My Test Video');

      await treeView.clickItem('My Test Video');

      await expect(page.getByRole('heading', { name: 'My Test Video' })).toBeVisible();
    });
  });

  test.describe('Responsive Scaling', () => {
    test('should scale video when window height is small', async ({ page, addVideoModal, treeView, videoPlayer }) => {
      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Scale Test Video');

      await treeView.clickItem('Scale Test Video');

      await page.setViewportSize({ width: 1200, height: 400 });

      await expect(videoPlayer.iframe).toBeVisible();

      const iframeBox = await videoPlayer.iframe.boundingBox();
      const viewportSize = page.viewportSize();

      expect(iframeBox).toBeTruthy();
      if (iframeBox && viewportSize) {
        expect(iframeBox.y + iframeBox.height).toBeLessThanOrEqual(viewportSize.height);
      }

      await expect(page.getByRole('heading', { name: 'Scale Test Video' })).toBeVisible();
    });

    test('should scale video when window width is small', async ({ page, addVideoModal, treeView, videoPlayer }) => {
      await addVideoModal.open();
      await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Width Test Video');

      await treeView.clickItem('Width Test Video');

      await page.setViewportSize({ width: 600, height: 800 });

      const iframeBox = await videoPlayer.iframe.boundingBox();
      const viewportSize = page.viewportSize();

      expect(iframeBox).toBeTruthy();
      if (iframeBox && viewportSize) {
        expect(iframeBox.x + iframeBox.width).toBeLessThanOrEqual(viewportSize.width);
      }
    });
  });
});
