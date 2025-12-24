import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useState } from 'react';
import { useVideoStore } from '../../stores/videoStore';
import { TreeItemComponent } from './TreeItem';
import type { GroupItem, VideoItem } from '../../types';

interface TreeViewProps {
  onEditVideo: (video: VideoItem) => void;
}

export function TreeView({ onEditVideo }: TreeViewProps) {
  const { items, moveItem } = useVideoStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeItem = items.find(i => i.id === active.id);
    const overItem = items.find(i => i.id === over.id);

    if (!activeItem || !overItem) return;

    // Prevent dropping a group into itself or its descendants
    if (activeItem.type === 'group') {
      const isDescendant = (itemId: string, ancestorId: string): boolean => {
        const item = items.find(i => i.id === itemId);
        if (!item || !item.parentId) return false;
        if (item.parentId === ancestorId) return true;
        return isDescendant(item.parentId, ancestorId);
      };

      if (isDescendant(overItem.id, activeItem.id)) {
        return;
      }
    }

    let newParentId: string | null;
    let newOrder: number;

    if (overItem.type === 'group') {
      // Dropping ON a group -> move inside it at the end
      newParentId = overItem.id;
      const siblings = items.filter(i => i.parentId === overItem.id);
      newOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.order)) + 1 : 0;
    } else {
      // Dropping ON a video -> place at its position
      newParentId = overItem.parentId;
      newOrder = overItem.order;

      // Shift siblings down to make room
      const siblings = items
        .filter(i => i.parentId === newParentId && i.id !== activeItem.id)
        .sort((a, b) => a.order - b.order);

      siblings.forEach((sibling) => {
        if (sibling.order >= newOrder) {
          moveItem(sibling.id, newParentId, sibling.order + 1);
        }
      });
    }

    moveItem(activeItem.id, newParentId, newOrder);
  };

  // Build tree structure
  const buildTree = (parentId: string | null, depth: number): React.ReactNode[] => {
    const children = items
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.order - b.order);

    return children.map(item => (
      <TreeItemComponent
        key={item.id}
        item={item}
        depth={depth}
        isDragging={activeId === item.id}
        onEditVideo={onEditVideo}
      >
        {item.type === 'group' && buildTree(item.id, depth + 1)}
      </TreeItemComponent>
    ));
  };

  const activeItem = activeId ? items.find(i => i.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="py-2">
        {items.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">
            No items. Add a group or video.
          </div>
        ) : (
          buildTree(null, 0)
        )}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="bg-gray-700 rounded px-3 py-1.5 text-sm text-white shadow-lg border border-gray-600">
            {activeItem.type === 'group'
              ? (activeItem as GroupItem).name
              : (activeItem as any).title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
