import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { ChevronRight, ChevronDown, Folder, Video, Trash2, GripVertical, Pencil, Check, X, Circle, CheckCircle2, Star } from 'lucide-react';
import { useVideoStore } from '../../stores/videoStore';
import type { TreeItem as TreeItemType, GroupItem, VideoItem, VideoStatus } from '../../types';

interface TreeItemProps {
  item: TreeItemType;
  depth: number;
  children?: React.ReactNode;
  isDragging?: boolean;
  onEditVideo: (video: VideoItem) => void;
}

export function TreeItemComponent({ item, depth, children, isDragging: isDraggingProp, onEditVideo }: TreeItemProps) {
  const { t } = useTranslation();
  const { selectVideo, selectedVideoId, toggleGroup, removeItem, updateItem } = useVideoStore();

  const handleToggleWatched = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'video') {
      const video = item as VideoItem;
      const currentStatus = video.status || 'none';
      // Toggle between watched and to-watch (or none if it was watched)
      const newStatus: VideoStatus = currentStatus === 'watched' ? 'to-watch' : 'watched';
      updateItem(item.id, { status: newStatus });
    }
  };
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging: isDraggingLocal,
  } = useDraggable({ id: item.id });

  const {
    setNodeRef: setDropRef,
    isOver,
  } = useDroppable({ id: item.id });

  const isDragging = isDraggingProp || isDraggingLocal;

  const isVideo = item.type === 'video';
  const isGroup = item.type === 'group';
  const isSelected = isVideo && selectedVideoId === item.id;

  const handleClick = () => {
    if (isEditing) return;
    if (isVideo) {
      selectVideo(item.id);
    } else {
      toggleGroup(item.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(isVideo ? t('treeItem.deleteVideo') : t('treeItem.deleteGroup'))) {
      removeItem(item.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVideo) {
      // Open edit modal for videos
      onEditVideo(item as VideoItem);
    } else {
      // Inline edit for groups
      const currentName = (item as GroupItem).name;
      setEditValue(currentName);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editValue.trim()) {
      // Only groups use inline editing now
      updateItem(item.id, { name: editValue.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit(e as unknown as React.MouseEvent);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div ref={setDropRef}>
      <div
        ref={setDragRef}
        className={`
          flex items-center gap-1 px-2 py-1.5 cursor-pointer rounded group
          hover:bg-gray-700
          ${isSelected ? 'bg-blue-600 hover:bg-blue-600' : ''}
          ${isOver && isGroup ? 'ring-2 ring-blue-400 bg-blue-900/30' : ''}
          ${isOver && !isGroup ? 'border-t-2 border-blue-400' : ''}
          ${isDragging ? 'opacity-30' : ''}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        <button
          className="p-0.5 hover:bg-gray-600 rounded cursor-grab opacity-50 group-hover:opacity-100"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} className="text-gray-400" />
        </button>

        {isGroup && (
          <span className="text-gray-400">
            {(item as GroupItem).isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </span>
        )}

        {isGroup ? (
          <Folder size={16} className="text-yellow-500 flex-shrink-0" />
        ) : (
          <Video size={16} className="text-blue-400 flex-shrink-0" />
        )}

        {isVideo && (() => {
          const video = item as VideoItem;
          const status = video.status || 'none';
          const isWatched = status === 'watched';

          return (
            <button
              onClick={handleToggleWatched}
              className="flex-shrink-0 p-0.5 hover:bg-gray-600 rounded"
              title={isWatched ? t('treeItem.markAsUnwatched') : t('treeItem.markAsWatched')}
            >
              {isWatched ? (
                <CheckCircle2 size={14} className="text-green-500" />
              ) : (
                <Circle size={14} className="text-gray-500" />
              )}
            </button>
          );
        })()}

        {isVideo && (item as VideoItem).status === 'important' && (
          <span title={t('treeItem.important')} className="flex-shrink-0">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
          </span>
        )}

        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 px-1 py-0.5 bg-gray-600 border border-gray-500 rounded text-sm text-white ml-1 focus:outline-none focus:border-blue-500"
            autoFocus
          />
        ) : (
          <span className="flex-1 truncate text-sm text-white ml-1">
            {isGroup ? (item as GroupItem).name : (item as VideoItem).title}
          </span>
        )}

        {isEditing ? (
          <>
            <button
              className="p-1 hover:bg-green-600 rounded"
              onClick={handleSaveEdit}
            >
              <Check size={14} className="text-green-400 hover:text-white" />
            </button>
            <button
              className="p-1 hover:bg-gray-600 rounded"
              onClick={handleCancelEdit}
            >
              <X size={14} className="text-gray-400 hover:text-white" />
            </button>
          </>
        ) : (
          <>
            <button
              className="p-1 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100"
              onClick={handleEdit}
            >
              <Pencil size={14} className="text-gray-400 hover:text-white" />
            </button>
            <button
              className="p-1 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100"
              onClick={handleDelete}
            >
              <Trash2 size={14} className="text-gray-400 hover:text-white" />
            </button>
          </>
        )}
      </div>

      {isGroup && (item as GroupItem).isExpanded && children}
    </div>
  );
}
