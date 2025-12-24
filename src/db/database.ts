import Dexie, { type EntityTable } from 'dexie';
import type { VideoItem, GroupItem } from '../types';

const db = new Dexie('VidaryDB') as Dexie & {
  videos: EntityTable<VideoItem, 'id'>;
  groups: EntityTable<GroupItem, 'id'>;
};

db.version(1).stores({
  videos: 'id, parentId, order, createdAt',
  groups: 'id, parentId, order, createdAt',
});

export { db };
