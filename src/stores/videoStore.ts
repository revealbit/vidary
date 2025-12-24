import { create } from 'zustand';
import { db } from '../db/database';
import type { AppState, TreeItem, VideoItem, GroupItem } from '../types';
import { validateImportData } from '../utils/validation';

function generateId(): string {
  return crypto.randomUUID();
}

export const useVideoStore = create<AppState>((set, get) => ({
  items: [],
  selectedVideoId: null,

  addVideo: async (videoData) => {
    const siblings = get().items.filter(i => i.parentId === videoData.parentId);
    const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.order)) : -1;

    const video: VideoItem = {
      ...videoData,
      id: generateId(),
      order: maxOrder + 1,
      type: 'video',
      createdAt: Date.now(),
    };

    await db.videos.add(video);
    set((state) => ({ items: [...state.items, video] }));
  },

  addGroup: async (name, parentId) => {
    const siblings = get().items.filter(i => i.parentId === parentId);
    const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.order)) : -1;

    const group: GroupItem = {
      id: generateId(),
      name,
      parentId,
      order: maxOrder + 1,
      type: 'group',
      isExpanded: true,
      createdAt: Date.now(),
    };

    await db.groups.add(group);
    set((state) => ({ items: [...state.items, group] }));
  },

  removeItem: async (id) => {
    const item = get().items.find(i => i.id === id);
    if (!item) return;

    // Recursively get all descendant IDs
    const getDescendantIds = (parentId: string): string[] => {
      const children = get().items.filter(i => i.parentId === parentId);
      return children.flatMap(child => [child.id, ...getDescendantIds(child.id)]);
    };

    const idsToRemove = [id, ...getDescendantIds(id)];

    // Remove from database
    const videos = get().items.filter(i => idsToRemove.includes(i.id) && i.type === 'video');
    const groups = get().items.filter(i => idsToRemove.includes(i.id) && i.type === 'group');

    await db.videos.bulkDelete(videos.map(v => v.id));
    await db.groups.bulkDelete(groups.map(g => g.id));

    set((state) => ({
      items: state.items.filter(i => !idsToRemove.includes(i.id)),
      selectedVideoId: idsToRemove.includes(state.selectedVideoId || '') ? null : state.selectedVideoId,
    }));
  },

  updateItem: async (id, updates) => {
    const item = get().items.find(i => i.id === id);
    if (!item) return;

    if (item.type === 'video') {
      await db.videos.update(id, updates as Partial<VideoItem>);
    } else {
      await db.groups.update(id, updates as Partial<GroupItem>);
    }

    set((state) => ({
      items: state.items.map(i => (i.id === id ? { ...i, ...updates } as TreeItem : i)),
    }));
  },

  moveItem: async (id, newParentId, newOrder) => {
    const item = get().items.find(i => i.id === id);
    if (!item) return;

    const updates = { parentId: newParentId, order: newOrder };

    if (item.type === 'video') {
      await db.videos.update(id, updates);
    } else {
      await db.groups.update(id, updates);
    }

    set((state) => ({
      items: state.items.map(i => (i.id === id ? { ...i, ...updates } : i)),
    }));
  },

  toggleGroup: async (id) => {
    const group = get().items.find(i => i.id === id && i.type === 'group') as GroupItem | undefined;
    if (!group) return;

    const newExpanded = !group.isExpanded;
    await db.groups.update(id, { isExpanded: newExpanded });

    set((state) => ({
      items: state.items.map(i =>
        i.id === id ? { ...i, isExpanded: newExpanded } : i
      ),
    }));
  },

  selectVideo: (id) => {
    set({ selectedVideoId: id });
  },

  loadItems: async () => {
    const videos = await db.videos.toArray();
    const groups = await db.groups.toArray();
    set({ items: [...videos, ...groups] });
  },

  exportData: () => {
    const { items } = get();
    return JSON.stringify(items, null, 2);
  },

  importData: async (json) => {
    // Validate and sanitize import data
    const validation = validateImportData(json);
    if (!validation.valid || !validation.items) {
      throw new Error(validation.error || 'Invalid import data');
    }

    const items = validation.items;

    // Clear existing data
    await db.videos.clear();
    await db.groups.clear();

    // Add validated items
    const videos = items.filter((i): i is VideoItem => i.type === 'video');
    const groups = items.filter((i): i is GroupItem => i.type === 'group');

    await db.videos.bulkAdd(videos);
    await db.groups.bulkAdd(groups);

    set({ items, selectedVideoId: null });
  },
}));
