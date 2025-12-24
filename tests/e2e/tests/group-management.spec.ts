import { test, expect } from '../fixtures/custom-fixtures';
import { TEXT_CONTENT } from '../config/test-constants';

test.describe('Group Management', () => {
  test.beforeEach(async ({ page, dbHelpers }) => {
    await page.goto('/');
    await dbHelpers.clearDatabase();
    await page.reload();
  });

  test.describe('Add Group', () => {
    test('should open add group modal', async ({ page, addGroupModal }) => {
      await addGroupModal.open();
      await expect(addGroupModal.heading).toBeVisible();
    });

    test('should add group', async ({ page, addGroupModal, treeView }) => {
      await addGroupModal.open();
      await addGroupModal.addGroup('New Test Group');

      await expect(treeView.getItemByName('New Test Group')).toBeVisible();
    });

    test('should show error for empty name', async ({ page, addGroupModal }) => {
      await addGroupModal.open();
      await addGroupModal.addButton.click();

      await expect(page.getByText(TEXT_CONTENT.ERROR_EMPTY_NAME)).toBeVisible();
    });

    test('should sort parent groups alphabetically in AddGroupModal', async ({ page, addGroupModal }) => {
      await addGroupModal.open();
      await addGroupModal.addGroup('Zebra');

      await addGroupModal.open();
      await addGroupModal.addGroup('Alfa');

      await addGroupModal.open();
      await addGroupModal.addGroup('Middle');

      await addGroupModal.open();

      const options = await addGroupModal.getAllParentOptions();

      expect(options[0]).toBe(TEXT_CONTENT.ROOT_PARENT_LABEL);
      expect(options[1]).toBe('Alfa');
      expect(options[2]).toBe('Middle');
      expect(options[3]).toBe('Zebra');
    });

    test('should sort groups alphabetically in AddVideoModal', async ({ page, addGroupModal, addVideoModal }) => {
      await addGroupModal.open();
      await addGroupModal.addGroup('Zebra');

      await addGroupModal.open();
      await addGroupModal.addGroup('Apple');

      await addGroupModal.open();
      await addGroupModal.addGroup('Beta');

      await addVideoModal.open();

      const options = await addVideoModal.getAllGroupOptions();

      expect(options[0]).toBe(TEXT_CONTENT.ROOT_GROUP_LABEL);
      expect(options[1]).toBe('Apple');
      expect(options[2]).toBe('Beta');
      expect(options[3]).toBe('Zebra');
    });

    test('should sort groups alphabetically in EditVideoModal', async ({ page, addGroupModal, addVideoModal, treeView, editVideoModal }) => {
      await addGroupModal.open();
      await addGroupModal.addGroup('Lemon');

      await addGroupModal.open();
      await addGroupModal.addGroup('Watermelon');

      await addVideoModal.open();
      await addVideoModal.addVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Sort Test Video');

      await treeView.editItem('Sort Test Video');

      const options = await editVideoModal.getAllGroupOptions();

      expect(options[0]).toBe(TEXT_CONTENT.ROOT_GROUP_LABEL);
      expect(options[1]).toBe('Lemon');
      expect(options[2]).toBe('Watermelon');
    });
  });

  test.describe('Edit Group', () => {
    test('should edit group name', async ({ page, addGroupModal, treeView }) => {
      await addGroupModal.open();
      await addGroupModal.addGroup('Original Group');

      await treeView.editGroupName('Original Group', 'Renamed Group', true);

      await expect(treeView.getItemByName('Renamed Group')).toBeVisible();
    });

    test('should cancel edit with Escape', async ({ page, addGroupModal, treeView }) => {
      await addGroupModal.open();
      await addGroupModal.addGroup('Escape Test Group');

      await treeView.editGroupName('Escape Test Group', 'Changed', false);

      await expect(treeView.getItemByName('Escape Test Group')).toBeVisible();
    });
  });

  test.describe('Delete Group', () => {
    test('should delete group with contents', async ({ page, addGroupModal, treeView }) => {
      await addGroupModal.open();
      await addGroupModal.addGroup('Group To Delete');

      page.on('dialog', dialog => dialog.accept());
      await treeView.deleteItem('Group To Delete');

      await expect(treeView.getItemByName('Group To Delete')).not.toBeVisible();
    });
  });

  test.describe('Tree Operations', () => {
    test('should expand/collapse group', async ({ page, addGroupModal, addVideoModal, treeView }) => {
      await addGroupModal.open();
      await addGroupModal.addGroup('Test Group');

      await addVideoModal.open();
      await addVideoModal.addVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Video in Group', {
        group: 'Test Group'
      });

      await expect(treeView.getItemByName('Video in Group')).toBeVisible();

      await treeView.clickItem('Test Group');
      await expect(treeView.getItemByName('Video in Group')).not.toBeVisible();

      await treeView.clickItem('Test Group');
      await expect(treeView.getItemByName('Video in Group')).toBeVisible();
    });

    test('should add video to specific group', async ({ page, addGroupModal, addVideoModal, treeView }) => {
      await addGroupModal.open();
      await addGroupModal.addGroup('Parent Group');

      await addVideoModal.open();
      await addVideoModal.addVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Nested Video', {
        group: 'Parent Group'
      });

      await expect(treeView.getItemByName('Nested Video')).toBeVisible();
    });
  });
});
