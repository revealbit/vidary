import { test, expect } from '@playwright/test';

test.describe('Vidary Video Viewer', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      indexedDB.deleteDatabase('VidaryDB');
    });
    await page.reload();
  });

  test.describe('Initial State', () => {
    test('should display empty state message', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('Select a video from the list')).toBeVisible();
      await expect(page.getByText('No items. Add a group or video.')).toBeVisible();
    });

    test('should display sidebar with title', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('Vidary')).toBeVisible();
    });

    test('should display add buttons', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('button', { name: /Video/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /Group/ })).toBeVisible();
    });
  });

  test.describe('Add Video', () => {
    test('should open add video modal', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /Video/ }).click();
      await expect(page.getByText('Add Video')).toBeVisible();
      await expect(page.getByPlaceholder('https://www.youtube.com/watch?v=...')).toBeVisible();
    });

    test('should add video with standard YouTube URL', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /Video/ }).click();

      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

      // Wait for title to be fetched or fill manually
      await page.waitForTimeout(2000);
      const titleInput = page.getByPlaceholder('Video name');
      const titleValue = await titleInput.inputValue();

      if (!titleValue) {
        await titleInput.fill('Test Video');
      }

      await page.getByRole('button', { name: 'Add' }).click();

      // Video should appear in tree
      await expect(page.locator('.truncate').filter({ hasText: /.+/ }).first()).toBeVisible();
    });

    test('should add video with YouTube Shorts URL', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /Video/ }).click();

      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/shorts/JGaT75zoDlk');
      await page.waitForTimeout(2000);

      const titleInput = page.getByPlaceholder('Video name');
      const titleValue = await titleInput.inputValue();
      if (!titleValue) {
        await titleInput.fill('Test Shorts');
      }

      await page.getByRole('button', { name: 'Add' }).click();

      await expect(page.locator('.truncate').filter({ hasText: /.+/ }).first()).toBeVisible();
    });

    test('should show error for invalid URL', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /Video/ }).click();

      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('invalid-url');
      await page.getByPlaceholder('Video name').fill('Test');
      await page.getByRole('button', { name: 'Add' }).click();

      await expect(page.getByText('Invalid YouTube URL')).toBeVisible();
    });

    test('should close modal on cancel', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect(page.getByText('Add Video')).not.toBeVisible();
    });
  });

  test.describe('Add Group', () => {
    test('should open add group modal', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /Group/ }).click();
      await expect(page.getByRole('heading', { name: 'Add Group' })).toBeVisible();
    });

    test('should add group', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /Group/ }).click();

      await page.getByPlaceholder('e.g. Basic Trainings').fill('New Test Group');
      await page.getByRole('button', { name: 'Add' }).click();

      // Use specific selector to avoid matching combobox option
      const groupSpan = page.locator('span.truncate').filter({ hasText: 'New Test Group' });
      await expect(groupSpan).toBeVisible();
    });

    test('should show error for empty name', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByRole('button', { name: 'Add' }).click();

      await expect(page.getByText('Group name is required')).toBeVisible();
    });

    test('should sort parent groups alphabetically in AddGroupModal', async ({ page }) => {
      await page.goto('/');

      // Add groups in non-alphabetical order
      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Zebra');
      await page.getByRole('button', { name: 'Add' }).click();

      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Alfa');
      await page.getByRole('button', { name: 'Add' }).click();

      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Middle');
      await page.getByRole('button', { name: 'Add' }).click();

      // Open add group modal and check order in combobox
      await page.getByRole('button', { name: /Group/ }).click();

      // Get all options from the combobox
      const options = await page.locator('select option').allTextContents();

      // First option should be "None (root)", then alphabetically sorted groups
      expect(options[0]).toBe('None (root)');
      expect(options[1]).toBe('Alfa');
      expect(options[2]).toBe('Middle');
      expect(options[3]).toBe('Zebra');
    });

    test('should sort groups alphabetically in AddVideoModal', async ({ page }) => {
      await page.goto('/');

      // Add groups in non-alphabetical order
      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Zebra');
      await page.getByRole('button', { name: 'Add' }).click();

      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Apple');
      await page.getByRole('button', { name: 'Add' }).click();

      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Beta');
      await page.getByRole('button', { name: 'Add' }).click();

      // Open add video modal and check order in combobox
      await page.getByRole('button', { name: /Video/ }).click();

      // Get all options from the combobox
      const options = await page.locator('select option').allTextContents();

      // First option should be "No group (root)", then alphabetically sorted groups
      // English locale should sort: Apple, Beta, Zebra
      expect(options[0]).toBe('No group (root)');
      expect(options[1]).toBe('Apple');
      expect(options[2]).toBe('Beta');
      expect(options[3]).toBe('Zebra');
    });

    test('should sort groups alphabetically in EditVideoModal', async ({ page }) => {
      await page.goto('/');

      // Add groups in non-alphabetical order
      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Cytryna');
      await page.getByRole('button', { name: 'Add' }).click();

      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Arbuz');
      await page.getByRole('button', { name: 'Add' }).click();

      // Add a video
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Sort Test Video');
      await page.getByRole('button', { name: 'Add' }).click();

      // Open edit modal - use specific row selector
      const videoRow = page.locator('div').filter({ hasText: /^Sort Test Video$/ }).first();
      await videoRow.hover();
      await videoRow.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).click();

      // Get all options from the combobox
      const options = await page.locator('select option').allTextContents();

      // First option should be "No group (root)", then alphabetically sorted groups
      expect(options[0]).toBe('No group (root)');
      expect(options[1]).toBe('Lemon');
      expect(options[2]).toBe('Watermelon');
    });
  });

  test.describe('Video Player', () => {
    test('should display video when selected', async ({ page }) => {
      await page.goto('/');

      // Add a video first
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Test Video');
      await page.getByRole('button', { name: 'Add' }).click();

      // Click on video
      await page.getByText('Test Video').click();

      // Check iframe is displayed
      await expect(page.locator('iframe')).toBeVisible();
      await expect(page.locator('iframe')).toHaveAttribute('src', /youtube\.com\/embed\/dQw4w9WgXcQ/);
    });

    test('should display video title below player', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('My Test Video');
      await page.getByRole('button', { name: 'Add' }).click();

      await page.getByText('My Test Video').first().click();

      // Title should appear in player area
      await expect(page.getByRole('heading', { name: 'My Test Video' })).toBeVisible();
    });

    test('should scale video when window height is small', async ({ page }) => {
      await page.goto('/');

      // Add a video
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Scale Test Video');
      await page.getByRole('button', { name: 'Add' }).click();

      await page.getByText('Scale Test Video').click();

      // Resize window to small height
      await page.setViewportSize({ width: 1200, height: 400 });

      // Video iframe should be visible and fit within viewport
      const iframe = page.locator('iframe');
      await expect(iframe).toBeVisible();

      // Get iframe bounding box
      const iframeBox = await iframe.boundingBox();
      const viewportSize = page.viewportSize();

      // Iframe should not exceed viewport height (minus some padding for title bar)
      expect(iframeBox).toBeTruthy();
      if (iframeBox && viewportSize) {
        expect(iframeBox.y + iframeBox.height).toBeLessThanOrEqual(viewportSize.height);
      }

      // Title should still be visible
      await expect(page.getByRole('heading', { name: 'Scale Test Video' })).toBeVisible();
    });

    test('should scale video when window width is small', async ({ page }) => {
      await page.goto('/');

      // Add a video first
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Width Test Video');
      await page.getByRole('button', { name: 'Add' }).click();

      // Select video
      await page.getByText('Width Test Video').click();

      // Resize to narrow width
      await page.setViewportSize({ width: 600, height: 800 });

      const iframe = page.locator('iframe');
      await expect(iframe).toBeVisible();

      const iframeBox = await iframe.boundingBox();
      const viewportSize = page.viewportSize();

      expect(iframeBox).toBeTruthy();
      if (iframeBox && viewportSize) {
        // Iframe should fit within available width
        expect(iframeBox.x + iframeBox.width).toBeLessThanOrEqual(viewportSize.width);
      }
    });
  });

  test.describe('Video Status and Description', () => {
    test('should add video with status and description', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Status Test Video');

      // Select status
      await page.locator('select').nth(1).selectOption('important');

      // Add description
      await page.getByPlaceholder('Additional information about the video...').fill('This is an important video for learning');

      await page.getByRole('button', { name: 'Add' }).click();

      // Video should appear with status icon
      const videoSpan = page.locator('span.truncate').filter({ hasText: 'Status Test Video' });
      await expect(videoSpan).toBeVisible();

      // Star icon should be visible (for important status)
      await expect(page.locator('svg.lucide-star')).toBeVisible();
    });

    test('should display description in video player footer', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Description Test');
      await page.getByPlaceholder('Additional information about the video...').fill('Test video description');
      await page.getByRole('button', { name: 'Add' }).click();

      // Click video to play
      await page.getByText('Description Test').click();

      // Description should be visible in footer
      await expect(page.getByText('Test video description')).toBeVisible();
    });

    test('should edit video status', async ({ page }) => {
      await page.goto('/');

      // Add video with no status
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Edit Status Video');
      await page.getByRole('button', { name: 'Add' }).click();

      // Open edit modal
      const videoRow = page.locator('div').filter({ hasText: /^Edit Status Video$/ }).first();
      await videoRow.hover();
      await videoRow.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).click();

      // Change status to watched (second select is status)
      await page.locator('select').nth(1).selectOption('watched');
      await page.getByRole('button', { name: 'Save' }).click();

      // Button title should indicate video is watched
      await expect(page.getByTitle('Mark as unwatched')).toBeVisible();
    });

    test('should toggle watched status with one click', async ({ page }) => {
      await page.goto('/');

      // Add video
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Toggle Test Video');
      await page.getByRole('button', { name: 'Add' }).click();

      // Initially should show empty circle (not watched)
      const toggleButton = page.getByTitle('Mark as watched');
      await expect(toggleButton).toBeVisible();

      // Click the toggle button to mark as watched
      await toggleButton.click();

      // Should now show check circle (watched) - title changes
      const watchedButton = page.getByTitle('Mark as unwatched');
      await expect(watchedButton).toBeVisible();

      // Click again to mark as to-watch
      await watchedButton.click();

      // Should show empty circle again
      await expect(page.getByTitle('Mark as watched')).toBeVisible();
    });

    test('should update description in edit modal', async ({ page }) => {
      await page.goto('/');

      // Add video with description
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Update Desc Video');
      await page.getByPlaceholder('Additional information about the video...').fill('Old description');
      await page.getByRole('button', { name: 'Add' }).click();

      // Open edit modal
      const videoRow = page.locator('div').filter({ hasText: /^Update Desc Video$/ }).first();
      await videoRow.hover();
      await videoRow.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).click();

      // Update description
      await page.getByPlaceholder('Additional information about the video...').fill('New updated description');
      await page.getByRole('button', { name: 'Save' }).click();

      // Play video and check new description
      await page.getByText('Update Desc Video').click();
      await expect(page.getByText('New updated description')).toBeVisible();
    });
  });

  test.describe('Edit Items', () => {
    test('should edit video using modal', async ({ page }) => {
      await page.goto('/');

      // Add video
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Original Name');
      await page.getByRole('button', { name: 'Add' }).click();

      // Hover and click edit button - should open modal
      await page.getByText('Original Name').hover();
      await page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).click();

      // Modal should open with video data
      await expect(page.getByRole('heading', { name: 'Edit Video' })).toBeVisible();
      await expect(page.getByPlaceholder('https://www.youtube.com/watch?v=...')).toHaveValue('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

      // Edit name in modal
      await page.getByPlaceholder('Video name').fill('New Name');
      await page.getByRole('button', { name: 'Save' }).click();

      // Verify update
      const videoSpan = page.locator('span.truncate').filter({ hasText: 'New Name' });
      await expect(videoSpan).toBeVisible();
      await expect(page.locator('span.truncate').filter({ hasText: 'Original Name' })).not.toBeVisible();
    });

    test('should edit video URL in modal', async ({ page }) => {
      await page.goto('/');

      // Add video
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Test Video');
      await page.getByRole('button', { name: 'Add' }).click();

      // Open edit modal
      await page.getByText('Test Video').hover();
      await page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).click();

      // Change URL
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=abcdefghijk');
      await page.getByRole('button', { name: 'Save' }).click();

      // Verify video plays new URL
      await page.getByText('Test Video').click();
      await expect(page.locator('iframe')).toHaveAttribute('src', /youtube\.com\/embed\/abcdefghijk/);
    });

    test('should change video group in edit modal', async ({ page }) => {
      await page.goto('/');

      // Add group
      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Target Group');
      await page.getByRole('button', { name: 'Add' }).click();

      // Add video at root
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Move Video');
      await page.getByRole('button', { name: 'Add' }).click();

      // Open edit modal - find the row containing the video and then its edit button
      const videoRow = page.locator('div').filter({ hasText: /^Move Video$/ }).first();
      await videoRow.hover();
      await videoRow.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).click();

      // Change group
      await page.getByRole('combobox').first().selectOption({ label: 'Target Group' });
      await page.getByRole('button', { name: 'Save' }).click();

      // Collapse group - video should disappear
      const groupSpan = page.locator('span.truncate').filter({ hasText: 'Target Group' });
      await groupSpan.click();
      const videoSpan = page.locator('span.truncate').filter({ hasText: 'Move Video' });
      await expect(videoSpan).not.toBeVisible();

      // Expand group - video should appear
      await groupSpan.click();
      await expect(videoSpan).toBeVisible();
    });

    test('should refresh title from YouTube in edit modal', async ({ page }) => {
      await page.goto('/');

      // Add video with custom title
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Custom Title');
      await page.getByRole('button', { name: 'Add' }).click();

      // Open edit modal
      await page.getByText('Custom Title').hover();
      await page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).click();

      // Click refresh button
      await page.locator('button').filter({ has: page.locator('svg.lucide-refresh-cw') }).click();

      // Wait for title to be fetched
      await page.waitForTimeout(2000);

      // Title should change from custom title
      const titleInput = page.getByPlaceholder('Nazwa video');
      const newTitle = await titleInput.inputValue();
      expect(newTitle).not.toBe('Custom Title');
    });

    test('should edit group name', async ({ page }) => {
      await page.goto('/');

      // Add group
      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Original Group');
      await page.getByRole('button', { name: 'Add' }).click();

      // Edit
      await page.getByText('Original Group').hover();
      await page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).click();

      await page.locator('input[type="text"]').last().fill('Renamed Group');
      await page.keyboard.press('Enter');

      await expect(page.getByText('Renamed Group')).toBeVisible();
    });

    test('should cancel edit with Escape', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Escape Test Group');
      await page.getByRole('button', { name: 'Add' }).click();

      // Use specific selector to avoid matching option in combobox
      const groupSpan = page.locator('span.truncate').filter({ hasText: 'Escape Test Group' });
      await groupSpan.hover();
      await page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).click();

      await page.locator('input[type="text"]').last().fill('Changed');
      await page.keyboard.press('Escape');

      await expect(groupSpan).toBeVisible();
    });
  });

  test.describe('Delete Items', () => {
    test('should delete video', async ({ page }) => {
      await page.goto('/');

      // Add video
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('To Delete');
      await page.getByRole('button', { name: 'Add' }).click();

      // Delete
      page.on('dialog', dialog => dialog.accept());
      await page.getByText('To Delete').hover();
      await page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).click();

      await expect(page.getByText('To Delete')).not.toBeVisible();
    });

    test('should delete group with contents', async ({ page }) => {
      await page.goto('/');

      // Add group
      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Group To Delete');
      await page.getByRole('button', { name: 'Add' }).click();

      // Delete - use specific selector
      page.on('dialog', dialog => dialog.accept());
      const groupSpan = page.locator('span.truncate').filter({ hasText: 'Group To Delete' });
      await groupSpan.hover();
      await page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).click();

      await expect(groupSpan).not.toBeVisible();
    });
  });

  test.describe('Sidebar Controls', () => {
    test('should hide sidebar', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByText('Vidary')).toBeVisible();

      // Click hide button
      await page.locator('button').filter({ has: page.locator('svg.lucide-panel-left-close') }).click();

      await expect(page.getByText('Vidary')).not.toBeVisible();
    });

    test('should show sidebar after hiding', async ({ page }) => {
      await page.goto('/');

      // Hide
      await page.locator('button').filter({ has: page.locator('svg.lucide-panel-left-close') }).click();
      await expect(page.getByText('Vidary')).not.toBeVisible();

      // Show
      await page.locator('button').filter({ has: page.locator('svg.lucide-panel-left-open') }).click();
      await expect(page.getByText('Vidary')).toBeVisible();
    });

    test('should resize sidebar', async ({ page }) => {
      await page.goto('/');

      const resizer = page.locator('.cursor-col-resize').first();
      const box = await resizer.boundingBox();

      if (box) {
        // Drag to resize
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(400, box.y + box.height / 2);
        await page.mouse.up();

        // Check localStorage was updated
        const width = await page.evaluate(() => localStorage.getItem('sidebarWidth'));
        expect(parseInt(width || '0')).toBeGreaterThan(320);
      }
    });

    test('should persist sidebar visibility', async ({ page }) => {
      await page.goto('/');

      // Hide sidebar
      await page.locator('button').filter({ has: page.locator('svg.lucide-panel-left-close') }).click();

      // Reload
      await page.reload();

      // Should still be hidden
      await expect(page.getByText('Vidary')).not.toBeVisible();
    });
  });

  test.describe('Export/Import', () => {
    test('should export data', async ({ page }) => {
      await page.goto('/');

      // Add some data
      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Export Test');
      await page.getByRole('button', { name: 'Add' }).click();

      // Setup download listener
      const downloadPromise = page.waitForEvent('download');

      await page.getByRole('button', { name: /Export/ }).click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe('vidary-videos.json');
    });

    test('should import data', async ({ page }) => {
      await page.goto('/');

      // Create test data file
      const testData = JSON.stringify([
        {
          id: 'test-group-1',
          name: 'Imported Group',
          parentId: null,
          order: 0,
          type: 'group',
          isExpanded: true,
          createdAt: Date.now()
        }
      ]);

      // Setup file chooser
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByRole('button', { name: /Import/ }).click();

      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles({
        name: 'test.json',
        mimeType: 'application/json',
        buffer: Buffer.from(testData)
      });

      await expect(page.getByText('Imported Group')).toBeVisible();
    });
  });

  test.describe('Drag and Drop', () => {
    test('should move video into group by dragging', async ({ page }) => {
      await page.goto('/');

      // Create a group
      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Target Group');
      await page.getByRole('button', { name: 'Add' }).click();

      // Create a video at root level
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Draggable Video');
      await page.getByRole('button', { name: 'Add' }).click();

      // Get grip handle of video (the button with GripVertical icon)
      const videoRow = page.locator('div').filter({ hasText: /^Draggable Video$/ }).first();
      const videoGrip = videoRow.locator('button').first();

      const group = page.getByText('Target Group');

      // Manual drag using mouse events
      const gripBox = await videoGrip.boundingBox();
      const groupBox = await group.boundingBox();

      if (gripBox && groupBox) {
        await page.mouse.move(gripBox.x + gripBox.width / 2, gripBox.y + gripBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(groupBox.x + groupBox.width / 2, groupBox.y + groupBox.height / 2, { steps: 10 });
        await page.mouse.up();
      }

      // Wait for state to update
      await page.waitForTimeout(100);

      // Use more specific selector to avoid matching DragOverlay
      const videoSpan = page.locator('span.truncate').filter({ hasText: 'Draggable Video' });

      // Collapse and expand group to verify video is inside
      await group.click(); // collapse
      await expect(videoSpan).not.toBeVisible();

      await group.click(); // expand
      await expect(videoSpan).toBeVisible();
    });

    test('should reorder videos within same level', async ({ page }) => {
      await page.goto('/');

      // Create two videos
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Video A');
      await page.getByRole('button', { name: 'Add' }).click();

      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Video B');
      await page.getByRole('button', { name: 'Add' }).click();

      // Check initial order - Video A should be first
      const items = page.locator('.truncate');
      await expect(items.first()).toHaveText('Video A');

      // Get grip handle of Video B
      const videoBRow = page.locator('div').filter({ hasText: /^Video B$/ }).first();
      const videoBGrip = videoBRow.locator('button').first();
      const videoA = page.getByText('Video A');

      // Manual drag using mouse events
      const gripBox = await videoBGrip.boundingBox();
      const targetBox = await videoA.boundingBox();

      if (gripBox && targetBox) {
        await page.mouse.move(gripBox.x + gripBox.width / 2, gripBox.y + gripBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
        await page.mouse.up();
      }

      // Wait for state to update
      await page.waitForTimeout(100);

      // After drag, Video B should be first
      await expect(items.first()).toHaveText('Video B');
    });

    test('should move video out of group to root', async ({ page }) => {
      await page.goto('/');

      // Create a group with video inside
      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Source Group');
      await page.getByRole('button', { name: 'Add' }).click();

      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Nested Video');
      await page.getByRole('combobox').first().selectOption({ label: 'Source Group' });
      await page.getByRole('button', { name: 'Add' }).click();

      // Create another video at root to drag to
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Root Video');
      await page.getByRole('button', { name: 'Add' }).click();

      // Drag nested video to root video using manual mouse events
      const nestedVideoRow = page.locator('div').filter({ hasText: /^Nested Video$/ }).first();
      const nestedVideoGrip = nestedVideoRow.locator('button').first();
      const rootVideo = page.getByText('Root Video');

      const gripBox = await nestedVideoGrip.boundingBox();
      const targetBox = await rootVideo.boundingBox();

      if (gripBox && targetBox) {
        await page.mouse.move(gripBox.x + gripBox.width / 2, gripBox.y + gripBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
        await page.mouse.up();
      }

      // Wait for state to update
      await page.waitForTimeout(100);

      // Collapse group - nested video should still be visible (now at root)
      await page.getByText('Source Group').click();
      const nestedVideoSpan = page.locator('span.truncate').filter({ hasText: 'Nested Video' });
      await expect(nestedVideoSpan).toBeVisible();
    });

    test('should not allow dropping group into itself', async ({ page }) => {
      await page.goto('/');

      // Create a group
      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Self Group');
      await page.getByRole('button', { name: 'Add' }).click();

      // Try to drag group onto itself (should not change anything)
      const groupRow = page.locator('div').filter({ hasText: /^Self Group$/ }).first();
      const groupGrip = groupRow.locator('button').first();
      const group = page.getByText('Self Group');

      const gripBox = await groupGrip.boundingBox();
      const groupBox = await group.boundingBox();

      if (gripBox && groupBox) {
        await page.mouse.move(gripBox.x + gripBox.width / 2, gripBox.y + gripBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(groupBox.x + groupBox.width / 2, groupBox.y + groupBox.height / 2, { steps: 10 });
        await page.mouse.up();
      }

      // Wait for state to update
      await page.waitForTimeout(100);

      // Group should still exist and be visible (use specific selector to avoid DragOverlay)
      const groupSpan = page.locator('span.truncate').filter({ hasText: 'Self Group' });
      await expect(groupSpan).toBeVisible();
    });
  });

  test.describe('Tree Operations', () => {
    test('should expand/collapse group', async ({ page }) => {
      await page.goto('/');

      // Add group
      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Test Group');
      await page.getByRole('button', { name: 'Add' }).click();

      // Add video to group
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Video in Group');
      await page.getByRole('combobox').first().selectOption({ label: 'Test Group' });
      await page.getByRole('button', { name: 'Add' }).click();

      // Video should be visible (group expanded by default)
      await expect(page.getByText('Video in Group')).toBeVisible();

      // Click group to collapse
      await page.getByText('Test Group').click();

      // Video should be hidden
      await expect(page.getByText('Video in Group')).not.toBeVisible();

      // Click again to expand
      await page.getByText('Test Group').click();
      await expect(page.getByText('Video in Group')).toBeVisible();
    });

    test('should add video to specific group', async ({ page }) => {
      await page.goto('/');

      // Add group first
      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Parent Group');
      await page.getByRole('button', { name: 'Add' }).click();

      // Add video to group
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Nested Video');
      await page.getByRole('combobox').first().selectOption({ label: 'Parent Group' });
      await page.getByRole('button', { name: 'Add' }).click();

      // Video should be nested (indented)
      const videoElement = page.getByText('Nested Video');
      await expect(videoElement).toBeVisible();
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist videos after reload', async ({ page }) => {
      await page.goto('/');

      // Add video
      await page.getByRole('button', { name: /Video/ }).click();
      await page.getByPlaceholder('https://www.youtube.com/watch?v=...').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      await page.getByPlaceholder('Video name').fill('Persistent Video');
      await page.getByRole('button', { name: 'Add' }).click();

      await expect(page.getByText('Persistent Video')).toBeVisible();

      // Reload
      await page.reload();

      // Should still be there
      await expect(page.getByText('Persistent Video')).toBeVisible();
    });

    test('should persist groups after reload', async ({ page }) => {
      await page.goto('/');

      // Add group
      await page.getByRole('button', { name: /Group/ }).click();
      await page.getByPlaceholder('e.g. Basic Trainings').fill('Persistent Group');
      await page.getByRole('button', { name: 'Add' }).click();

      // Wait for group to appear
      await expect(page.getByText('Persistent Group')).toBeVisible();

      await page.reload();

      // Wait for data to load from IndexedDB
      await page.waitForTimeout(500);
      await expect(page.getByText('Persistent Group')).toBeVisible();
    });
  });
});
