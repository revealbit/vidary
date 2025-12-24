/**
 * Valid YouTube video ID format: 11 characters, alphanumeric with - and _
 */
const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extracts YouTube video ID from a URL.
 * Security: Only accepts HTTPS URLs from legitimate YouTube domains.
 */
export function extractYouTubeId(url: string): string | null {
  // Security: Validate URL format first
  if (typeof url !== 'string' || url.length === 0 || url.length > 2048) {
    return null;
  }

  // Security: Only accept HTTPS protocol
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  if (parsedUrl.protocol !== 'https:') {
    return null;
  }

  // Security: Only accept legitimate YouTube hostnames
  const validHosts = ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com'];
  if (!validHosts.includes(parsedUrl.hostname)) {
    return null;
  }

  // Extract video ID based on URL pattern
  let videoId: string | null = null;

  if (parsedUrl.hostname === 'youtu.be') {
    // https://youtu.be/VIDEO_ID
    videoId = parsedUrl.pathname.slice(1).split('/')[0];
  } else {
    const pathname = parsedUrl.pathname;

    if (pathname.startsWith('/watch')) {
      // https://youtube.com/watch?v=VIDEO_ID
      videoId = parsedUrl.searchParams.get('v');
    } else if (pathname.startsWith('/embed/')) {
      // https://youtube.com/embed/VIDEO_ID
      videoId = pathname.split('/embed/')[1]?.split('/')[0];
    } else if (pathname.startsWith('/v/')) {
      // https://youtube.com/v/VIDEO_ID
      videoId = pathname.split('/v/')[1]?.split('/')[0];
    } else if (pathname.startsWith('/shorts/')) {
      // https://youtube.com/shorts/VIDEO_ID
      videoId = pathname.split('/shorts/')[1]?.split('/')[0];
    } else if (pathname.startsWith('/live/')) {
      // https://youtube.com/live/VIDEO_ID
      videoId = pathname.split('/live/')[1]?.split('/')[0];
    }
  }

  // Security: Validate video ID format strictly
  if (videoId && YOUTUBE_ID_REGEX.test(videoId)) {
    return videoId;
  }

  return null;
}

/**
 * Returns thumbnail URL for a YouTube video.
 * Security: Validates youtubeId format before constructing URL.
 */
export function getYouTubeThumbnail(youtubeId: string): string {
  // Security: Validate ID format to prevent URL injection
  if (!YOUTUBE_ID_REGEX.test(youtubeId)) {
    return '';
  }
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}

/**
 * Validates that a string is a valid YouTube URL.
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}

export async function fetchYouTubeTitle(url: string): Promise<string | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.title || null;
  } catch {
    return null;
  }
}
