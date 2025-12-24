# Tests Directory

This directory contains all tests for the Vidary project.

## Structure

```
tests/
├── e2e/                    # End-to-end tests (Playwright)
│   ├── tests/              # Test specs organized by feature
│   ├── page-objects/       # Page Object Models
│   ├── fixtures/           # Custom test fixtures
│   ├── helpers/            # Test utilities
│   └── config/             # Test configuration
└── unit/                   # Unit tests (future)
    └── (to be added)
```

## Test Types

### E2E Tests (`tests/e2e/`)
End-to-end tests using Playwright that test the application from a user's perspective.

**Run E2E tests:**
```bash
npm test                    # Run all e2e tests
npm run test:ui             # Run with Playwright UI
npm run test:headed         # Run in headed mode
```

**Documentation:**
- See [tests/e2e/README.md](./e2e/README.md) for detailed e2e test documentation
- See [tests/e2e/MIGRATION_GUIDE.md](./e2e/MIGRATION_GUIDE.md) for migration details

### Unit Tests (`tests/unit/`)
Unit tests for individual components and utilities (to be added when needed).

**Recommended tools:**
- Vitest (native Vite support)
- React Testing Library
- @testing-library/jest-dom

## Adding New Tests

### For E2E Tests
1. Navigate to `tests/e2e/tests/`
2. Add tests to the appropriate feature file or create a new one
3. Use existing page objects and fixtures
4. Follow the patterns in existing tests

### For Unit Tests (when added)
1. Create test files colocated with source or in `tests/unit/`
2. Follow naming convention: `*.test.ts` or `*.test.tsx`
3. Use Vitest and React Testing Library

## Configuration

- **Playwright config**: `playwright.config.ts` (project root)
- **Vitest config**: Will be in `vite.config.ts` when unit tests are added

## Best Practices

1. ✅ Keep e2e and unit tests separate
2. ✅ Use Page Object Model for e2e tests
3. ✅ Keep tests focused and independent
4. ✅ Use descriptive test names
5. ✅ Clean up test data between tests
6. ✅ Use fixtures for common setup
