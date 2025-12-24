export const TEST_URLS = {
  SAMPLE_VIDEO: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  SAMPLE_SHORT: 'https://www.youtube.com/shorts/JGaT75zoDlk',
  INVALID_URL: 'invalid-url',
} as const;

export const TIMEOUTS = {
  TITLE_FETCH: 2000,
  STATE_UPDATE: 100,
  DB_LOAD: 500,
} as const;

export const SELECTORS = {
  TRUNCATE_TEXT: '.truncate',
  RESIZE_HANDLE: '.cursor-col-resize',
} as const;

export const TEXT_CONTENT = {
  APP_TITLE: 'Vidary',
  EMPTY_STATE: 'Select a video from the list',
  NO_ITEMS: 'No items. Add a group or video.',
  ADD_VIDEO_TITLE: 'Add Video',
  ADD_GROUP_TITLE: 'Add Group',
  EDIT_VIDEO_TITLE: 'Edit Video',
  ROOT_GROUP_LABEL: 'No group (root)',
  ROOT_PARENT_LABEL: 'None (root)',
  ERROR_INVALID_URL: 'Invalid YouTube URL',
  ERROR_EMPTY_NAME: 'Group name is required',
} as const;
