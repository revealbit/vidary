export type VideoStatus = 'none' | 'watched' | 'important' | 'to-watch' | 'in-progress';

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  youtubeId: string;
  parentId: string | null;
  order: number;
  type: 'video';
  createdAt: number;
  status?: VideoStatus;
  description?: string;
}

export interface GroupItem {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
  type: 'group';
  isExpanded: boolean;
  createdAt: number;
}

export type TreeItem = VideoItem | GroupItem;

export interface AppState {
  items: TreeItem[];
  selectedVideoId: string | null;

  // Actions
  addVideo: (video: Omit<VideoItem, 'id' | 'order' | 'type' | 'createdAt'>) => void;
  addGroup: (name: string, parentId: string | null) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<TreeItem>) => void;
  moveItem: (id: string, newParentId: string | null, newOrder: number) => void;
  toggleGroup: (id: string) => void;
  selectVideo: (id: string | null) => void;
  loadItems: () => Promise<void>;
  exportData: () => string;
  importData: (json: string) => Promise<void>;
}
