import { test as base } from '@playwright/test';
import { AddVideoModal } from '../page-objects/modals/add-video.modal';
import { AddGroupModal } from '../page-objects/modals/add-group.modal';
import { EditVideoModal } from '../page-objects/modals/edit-video.modal';
import { SidebarPage } from '../page-objects/sidebar.page';
import { VideoPlayerPage } from '../page-objects/video-player.page';
import { TreeViewPage } from '../page-objects/tree-view.page';
import { DbHelpers } from '../helpers/db-helpers';

type CustomFixtures = {
  addVideoModal: AddVideoModal;
  addGroupModal: AddGroupModal;
  editVideoModal: EditVideoModal;
  sidebar: SidebarPage;
  videoPlayer: VideoPlayerPage;
  treeView: TreeViewPage;
  dbHelpers: DbHelpers;
};

export const test = base.extend<CustomFixtures>({
  addVideoModal: async ({ page }, use) => {
    await use(new AddVideoModal(page));
  },
  addGroupModal: async ({ page }, use) => {
    await use(new AddGroupModal(page));
  },
  editVideoModal: async ({ page }, use) => {
    await use(new EditVideoModal(page));
  },
  sidebar: async ({ page }, use) => {
    await use(new SidebarPage(page));
  },
  videoPlayer: async ({ page }, use) => {
    await use(new VideoPlayerPage(page));
  },
  treeView: async ({ page }, use) => {
    await use(new TreeViewPage(page));
  },
  dbHelpers: async ({ page }, use) => {
    await use(new DbHelpers(page));
  },
});

export { expect } from '@playwright/test';
