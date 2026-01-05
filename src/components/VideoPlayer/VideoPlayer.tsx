import { useTranslation } from 'react-i18next';
import { useVideoStore } from '../../stores/videoStore';
import type { VideoItem } from '../../types';

export function VideoPlayer() {
  const { t } = useTranslation();
  const { items, selectedVideoId } = useVideoStore();

  const selectedVideo = items.find(
    (item) => item.id === selectedVideoId && item.type === 'video'
  ) as VideoItem | undefined;

  if (!selectedVideo) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="text-center">
          <p className="text-xl mb-2">{t('videoPlayer.selectVideo')}</p>
          <p className="text-sm">{t('videoPlayer.addVideoHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black min-h-0">
      <div className="flex-1 flex items-center justify-center p-4 min-h-0">
        <iframe
          className="max-w-full max-h-full"
          style={{
            aspectRatio: '16/9',
            width: 'min(100%, calc((100vh - 120px) * 16 / 9))',
            height: 'min(100%, calc((100vw) * 9 / 16))'
          }}
          src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
          title={selectedVideo.title}
          // Security: Minimal permissions - only what YouTube requires
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allowFullScreen
        />
      </div>
      <div className="p-4 bg-gray-800 border-t border-gray-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-white truncate">
          {selectedVideo.title}
        </h2>
        {selectedVideo.description && (
          <p className="mt-2 text-sm text-gray-400 whitespace-pre-wrap">
            {selectedVideo.description}
          </p>
        )}
      </div>
    </div>
  );
}
