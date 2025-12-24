# Project Context

## Purpose
Vidary is a lightweight YouTube video library manager that helps users organize their YouTube videos locally. Key goals:
- Provide an easy-to-use drag-and-drop interface for organizing videos
- Store everything locally (no backend required) using IndexedDB
- Organize videos in a tree-based folder structure with groups and categories
- Provide a built-in video player for seamless viewing

## Tech Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5
- **Local Storage**: Dexie 4 (IndexedDB wrapper)
- **Video Player**: React Player 3
- **Drag & Drop**: @dnd-kit (core, sortable, utilities)
- **Icons**: Lucide React
- **Testing**: Playwright
- **Linting**: ESLint 9 with TypeScript ESLint

## Project Conventions

### Code Style
- **TypeScript**: Strict typing enabled, use explicit types for all function parameters and return values
- **Component Structure**: Functional components with hooks only (no class components)
- **File Naming**: PascalCase for components (e.g., `VideoPlayer.tsx`), camelCase for utilities (e.g., `videoStore.ts`)
- **Import Order**: External dependencies first, then local imports (types, components, utilities)
- **Formatting**: Follow ESLint rules (React hooks plugin, React Refresh plugin)
- **ID Generation**: Use `crypto.randomUUID()` for generating IDs
- **Naming Conventions**:
  - Components: PascalCase with `.tsx` extension
  - Utilities/Stores: camelCase with `.ts` extension
  - Types: PascalCase (e.g., `VideoItem`, `AppState`)
  - Folders: kebab-case or PascalCase for component folders

### Architecture Patterns
- **State Management**: Centralized Zustand store (`videoStore.ts`) with all app state and actions
- **Data Persistence**: Two-layer architecture:
  - Zustand store for reactive UI state
  - Dexie/IndexedDB for persistent storage (all mutations sync to database)
- **Component Organization**:
  - Feature-based folder structure under `src/components/`
  - Each major component in its own folder (e.g., `VideoPlayer/`, `Sidebar/`)
  - Modals grouped in `AddVideoModal/` directory
- **Type System**: Central type definitions in `src/types/index.ts`
- **Data Model**: Tree structure with `TreeItem` union type (`VideoItem | GroupItem`)
  - Videos and groups both have `parentId`, `order`, and `type` fields
  - Groups have `isExpanded` state for UI
  - Videos have `status`, `url`, `youtubeId` fields
- **Local State**: Use React's built-in hooks (`useState`, `useRef`, `useEffect`) for component-local state
- **Global State Access**: Use Zustand selectors to avoid unnecessary re-renders

### Testing Strategy
- **Framework**: Playwright for end-to-end testing
- **Organization**: Feature-based test files in `tests/e2e/tests/`
- **Architecture**: Page Object Model (POM) pattern
  - All page objects in `tests/e2e/page-objects/`
  - Base page class provides common functionality
  - Custom fixtures inject page objects into tests
- **Test Structure**:
  - Custom fixtures in `fixtures/custom-fixtures.ts` provide POMs
  - Reusable test data in `fixtures/test-data.ts`
  - Constants in `config/test-constants.ts`
  - Database helpers in `helpers/db-helpers.ts`
- **Best Practices**:
  - Each test is independent and sets up its own data
  - Never use selectors directly in tests (use POMs)
  - Clean up database state in `beforeEach` hooks
  - Test user flows, not implementation details
- **Commands**:
  - `npm test` - Run all tests headless
  - `npm run test:ui` - Run with Playwright UI
  - `npm run test:headed` - Run in headed browser mode

### Git Workflow
- **Branch Strategy**: Feature branch workflow
  - ALWAYS create feature branches (`feature/description` or `bugfix/description`)
  - NEVER commit directly to `main` or `master`
- **Pre-merge Checklist**:
  - Run `npm run dev` and manually test
  - Run `npm run lint` (must pass)
  - Run `npm run build` (must succeed)
- **Commit Process**: Create feature branch → develop → test → push → create PR
- **Main Branch**: `main` is the primary branch for PRs

## Domain Context
- **YouTube Integration**: App extracts YouTube video IDs from URLs and uses them with React Player
- **Tree Structure**: Videos and groups form a hierarchical tree
  - Items can be nested infinitely
  - Each item has a `parentId` (null for root items) and `order` for sorting
  - Groups can be expanded/collapsed
- **Video Statuses**: Videos can be marked as: `none`, `watched`, `important`, `to-watch`, `in-progress`
- **Drag & Drop**: Items can be reordered and moved between groups using @dnd-kit
- **Sidebar**: Resizable panel (200-600px width) with localStorage persistence
- **Data Export/Import**: Full JSON export/import of all videos and groups

## Important Constraints
- **Client-side Only**: No backend server, all data stored in browser's IndexedDB
- **YouTube Only**: App is specifically designed for YouTube videos (uses YouTube IDs)
- **Local Storage**: All user data stays on their machine (privacy-focused)
- **Browser Compatibility**: Requires modern browser with IndexedDB support and ES2020+ features
- **No Authentication**: No user accounts or cloud sync (fully local)

## External Dependencies
- **YouTube**: Uses YouTube video IDs for embedding videos via React Player
  - No YouTube API key required (uses oEmbed for metadata)
  - Utility function in `src/utils/youtube.ts` extracts video IDs from URLs
- **React Player**: Handles video playback, supports YouTube natively
- **IndexedDB**: Browser-native storage (via Dexie wrapper)
  - Database name: `VidaryDB`
  - Two tables: `videos` and `groups`
