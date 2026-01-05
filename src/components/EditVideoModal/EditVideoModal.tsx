import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, RefreshCw } from 'lucide-react';
import { useVideoStore } from '../../stores/videoStore';
import { extractYouTubeId, isValidYouTubeUrl, fetchYouTubeTitle } from '../../utils/youtube';
import type { GroupItem, VideoItem, VideoStatus } from '../../types';

const STATUS_KEYS: { value: VideoStatus; key: string }[] = [
  { value: 'none', key: 'status.none' },
  { value: 'to-watch', key: 'status.toWatch' },
  { value: 'in-progress', key: 'status.inProgress' },
  { value: 'watched', key: 'status.watched' },
  { value: 'important', key: 'status.important' },
];

interface EditVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoItem | null;
}

export function EditVideoModal({ isOpen, onClose, video }: EditVideoModalProps) {
  const { t } = useTranslation();
  const { updateItem, moveItem, items } = useVideoStore();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [status, setStatus] = useState<VideoStatus>('none');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoadingTitle, setIsLoadingTitle] = useState(false);

  const groups = (items.filter(i => i.type === 'group') as GroupItem[])
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));

  useEffect(() => {
    if (video) {
      setUrl(video.url);
      setTitle(video.title);
      setParentId(video.parentId);
      setStatus(video.status || 'none');
      setDescription(video.description || '');
      setError('');
    }
  }, [video]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!video) return;

    if (!isValidYouTubeUrl(url)) {
      setError(t('addVideoModal.invalidUrl'));
      return;
    }

    const youtubeId = extractYouTubeId(url);
    if (!youtubeId) {
      setError(t('addVideoModal.cannotExtractId'));
      return;
    }

    if (!title.trim()) {
      setError(t('addVideoModal.titleRequired'));
      return;
    }

    // Update video data
    await updateItem(video.id, {
      title: title.trim(),
      url,
      youtubeId,
      status,
      description: description.trim(),
    });

    // Move to new group if changed
    if (parentId !== video.parentId) {
      const siblings = items.filter(i => i.parentId === parentId);
      const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.order)) : -1;
      await moveItem(video.id, parentId, maxOrder + 1);
    }

    onClose();
  };

  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);
    setError('');

    // Try to fetch title from YouTube when URL changes
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

  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">{t('editVideoModal.title')}</h2>
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
              {t('addVideoModal.urlLabel')}
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={t('addVideoModal.urlPlaceholder')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t('addVideoModal.titleLabel')}
            </label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('addVideoModal.titlePlaceholder')}
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
                title={t('addVideoModal.fetchTitle')}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t('addVideoModal.groupLabel')}
            </label>
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">{t('addVideoModal.noGroup')}</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t('addVideoModal.statusLabel')}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VideoStatus)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            >
              {STATUS_KEYS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.key)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t('addVideoModal.descriptionLabel')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('addVideoModal.descriptionPlaceholder')}
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
              {t('addVideoModal.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white"
            >
              {t('editVideoModal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
