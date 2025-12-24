# Vidary

A lightweight YouTube video library manager with drag-and-drop organization, local storage, and tree-based folder structure.

## Features

- Organize YouTube videos in a tree-based folder structure
- Drag-and-drop interface for easy organization
- Local storage using IndexedDB (no backend required)
- Built-in video player
- Group and categorize videos
- Fast and responsive UI

## Tech Stack

- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Dexie (IndexedDB wrapper) for local data storage
- Zustand for state management
- React Player for video playback
- @dnd-kit for drag-and-drop functionality

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Build

```bash
npm run build
```

### Testing

```bash
npm test              # Run tests
npm run test:ui       # Run tests with UI
npm run test:headed   # Run tests in headed mode
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run Playwright tests
