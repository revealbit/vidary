import { useState } from 'react';
import { Plus, FolderPlus, Download, Upload, PanelLeftClose } from 'lucide-react';
import { TreeView } from '../TreeView/TreeView';
import { AddVideoModal } from '../AddVideoModal/AddVideoModal';
import { AddGroupModal } from '../AddVideoModal/AddGroupModal';
import { EditVideoModal } from '../EditVideoModal/EditVideoModal';
import { useVideoStore } from '../../stores/videoStore';
import { MAX_IMPORT_FILE_SIZE } from '../../utils/validation';
import type { VideoItem } from '../../types';

interface SidebarProps {
  width: number;
  onToggle: () => void;
}

export function Sidebar({ width, onToggle }: SidebarProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const { exportData, importData } = useVideoStore();

  const handleEditVideo = (video: VideoItem) => {
    setEditingVideo(video);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vidary-videos.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Security: Enforce file size limit to prevent DoS
        if (file.size > MAX_IMPORT_FILE_SIZE) {
          alert(`File too large. Maximum size is ${MAX_IMPORT_FILE_SIZE / 1024 / 1024}MB`);
          return;
        }

        try {
          const text = await file.text();
          await importData(text);
        } catch (err) {
          // Show specific validation error to user
          const message = err instanceof Error ? err.message : 'Unknown error';
          alert(`Import failed: ${message}`);
        }
      }
    };
    input.click();
  };

  return (
    <div
      className="bg-gray-800 border-r border-gray-700 flex flex-col h-full flex-shrink-0"
      style={{ width: `${width}px` }}
    >
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-white">Vidary</h1>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            title="Hide panel"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white"
          >
            <Plus size={16} />
            Video
          </button>
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
          >
            <FolderPlus size={16} />
            Group
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300"
            title="Export data"
          >
            <Download size={14} />
            Export
          </button>
          <button
            onClick={handleImport}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300"
            title="Import data"
          >
            <Upload size={14} />
            Import
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <TreeView onEditVideo={handleEditVideo} />
      </div>

      <AddVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
      <AddGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />
      <EditVideoModal
        isOpen={editingVideo !== null}
        onClose={() => setEditingVideo(null)}
        video={editingVideo}
      />
    </div>
  );
}
