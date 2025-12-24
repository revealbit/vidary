// Valid UUID v4 format required by import validation
export const sampleGroup = {
  id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  name: 'Imported Group',
  parentId: null,
  order: 0,
  type: 'group' as const,
  isExpanded: true,
  createdAt: Date.now()
};

export const sampleVideo = {
  id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  title: 'Sample Video',
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  youtubeId: 'dQw4w9WgXcQ',
  parentId: null,
  order: 0,
  type: 'video' as const,
  status: 'to-watch' as const,
  description: '',
  createdAt: Date.now()
};

// Counter for generating unique UUIDs in tests
let testUuidCounter = 0;

function generateTestUUID(): string {
  testUuidCounter++;
  const hex = testUuidCounter.toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${hex}`;
}

export function createTestGroup(overrides: Partial<typeof sampleGroup> = {}) {
  return {
    ...sampleGroup,
    id: generateTestUUID(),
    createdAt: Date.now(),
    ...overrides
  };
}

export function createTestVideo(overrides: Partial<typeof sampleVideo> = {}) {
  return {
    ...sampleVideo,
    id: generateTestUUID(),
    createdAt: Date.now(),
    ...overrides
  };
}
