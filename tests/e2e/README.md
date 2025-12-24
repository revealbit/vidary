# E2E Test Suite Organization

This directory contains the end-to-end tests for Vidary, organized using best practices.

## Directory Structure

```
tests/
└── e2e/
    ├── fixtures/               # Test fixtures and setup
    │   ├── custom-fixtures.ts  # Custom Playwright fixtures with POMs
    │   └── test-data.ts        # Reusable test data factories
    ├── page-objects/           # Page Object Models
    │   ├── base.page.ts        # Base page class
    │   ├── sidebar.page.ts     # Sidebar interactions
    │   ├── video-player.page.ts# Video player interactions
    │   ├── tree-view.page.ts   # Tree navigation and interactions
    │   └── modals/             # Modal page objects
    │       ├── add-video.modal.ts
    │       ├── add-group.modal.ts
    │       └── edit-video.modal.ts
    ├── tests/                  # Feature-based test files
    │   ├── video-management.spec.ts
    │   ├── group-management.spec.ts
    │   ├── video-player.spec.ts
    │   ├── drag-and-drop.spec.ts
    │   ├── sidebar.spec.ts
    │   ├── data-persistence.spec.ts
    │   └── import-export.spec.ts
    ├── helpers/                # Test utilities
    │   ├── db-helpers.ts       # Database/storage utilities
    │   └── test-helpers.ts     # Common test helpers
    ├── config/                 # Test configuration
    │   └── test-constants.ts   # Constants and selectors
    └── app.spec.ts            # Original monolithic test file (kept for reference)
```

## Writing Tests

### Using Custom Fixtures

All test files use custom fixtures that provide easy access to page objects:

```typescript
import { test, expect } from '../fixtures/custom-fixtures';

test('example test', async ({ addVideoModal, treeView }) => {
  await addVideoModal.open();
  await addVideoModal.addVideo('https://...', 'My Video');
  await expect(treeView.getItemByName('My Video')).toBeVisible();
});
```

### Available Fixtures

- `addVideoModal` - Add Video Modal interactions
- `addGroupModal` - Add Group Modal interactions
- `editVideoModal` - Edit Video Modal interactions
- `sidebar` - Sidebar controls and actions
- `videoPlayer` - Video player interactions
- `treeView` - Tree navigation and item management
- `dbHelpers` - Database/localStorage utilities

### Using Constants

Import constants from `config/test-constants.ts`:

```typescript
import { TEST_URLS, TEXT_CONTENT, TIMEOUTS } from '../config/test-constants';

// Use predefined URLs
await addVideoModal.addVideo(TEST_URLS.SAMPLE_VIDEO, 'Title');

// Use text content constants
await expect(page.getByText(TEXT_CONTENT.ERROR_INVALID_URL)).toBeVisible();

// Use consistent timeouts
await page.waitForTimeout(TIMEOUTS.TITLE_FETCH);
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/video-management.spec.ts

# Run tests in UI mode
npm run test:ui

# Run tests in headed mode
npm run test:headed

# Run tests matching a pattern
npx playwright test --grep "should add video"
```

## Best Practices

1. **Keep tests independent** - Each test should set up its own data
2. **Use Page Object Models** - Never use selectors directly in tests
3. **Use descriptive test names** - Test names should clearly describe what they test
4. **Clean up between tests** - Use `beforeEach` to clear database state
5. **Don't repeat yourself** - Use helpers and fixtures for common operations
6. **Test user flows** - Focus on what users actually do, not implementation details

## Adding New Tests

1. Determine which feature file the test belongs to
2. Use existing fixtures and page objects
3. Add new page objects if needed for new UI components
4. Add constants to `test-constants.ts` for reusable values
5. Keep tests focused and readable

## Migration Notes

The original `app.spec.ts` file has been split into feature-based files. The original file is kept for reference but should not be used for new tests. All new tests should use the organized structure.
