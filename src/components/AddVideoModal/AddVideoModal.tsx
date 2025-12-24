import { useState } from 'react';
import { X, Loader2, RefreshCw } from 'lucide-react';
import { useVideoStore } from '../../stores/videoStore';
import { extractYouTubeId, isValidYouTubeUrl, fetchYouTubeTitle } from '../../utils/youtube';
import type { GroupItem, VideoStatus } from '../../types';

const STATUS_OPTIONS: { value: VideoStatus; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'to-watch', label: 'To Watch' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'watched', label: 'Watched' },
  { value: 'important', label: 'Important' },
];

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddVideoModal({ isOpen, onClose }: AddVideoModalProps) {
  const { addVideo, items } = useVideoStore();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [status, setStatus] = useState<VideoStatus>('none');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoadingTitle, setIsLoadingTitle] = useState(false);

  const groups = (items.filter(i => i.type === 'group') as GroupItem[])
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidYouTubeUrl(url)) {
      setError('Invalid YouTube URL');
      return;
    }

    const youtubeId = extractYouTubeId(url);
    if (!youtubeId) {
      setError('Cannot extract video ID from URL');
      return;
    }

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    await addVideo({
      title: title.trim(),
      url,
      youtubeId,
      parentId,
      status,
      description: description.trim(),
    });

    setUrl('');
    setTitle('');
    setParentId(null);
    setStatus('none');
    setDescription('');
    onClose();
  };

  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);
    setError('');

    // Try to fetch title from YouTube
    if (isValidYouTubeUrl(newUrl)) {
      setIsLoadingTitle(true);
      const fetchedTitle = await fetchYouTubeTitle(newUrl);
      setIsLoadingTitle(false);

      if (fetchedTitle) {
        setTitle(fetchedTitle);
      } else {
        // Fallback to video ID if fetch fails
        const videoId = extractYouTubeId(newUrl);
        if (videoId) {
          setTitle(`Video ${videoId.substring(0, 8)}`);
        }
      }
    }
  };

  const handleRefreshTitle = async () => {
    if (isValidYouTubeUrl(url)) {
      setIsLoadingTitle(true);
      const fetchedTitle = await fetchYouTubeTitle(url);
      setIsLoadingTitle(false);

      if (fetchedTitle) {
        setTitle(fetchedTitle);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Add Video</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              URL YouTube
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Video name"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                {isLoadingTitle && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 size={16} className="animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleRefreshTitle}
                disabled={!isValidYouTubeUrl(url) || isLoadingTitle}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title="Fetch original title from YouTube"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Group (optional)
            </label>
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">No group (root)</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VideoStatus)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional information about the video..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
