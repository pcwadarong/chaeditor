export type VideoProvider = 'upload' | 'youtube';

export type YoutubeVideoEmbedReference = {
  provider: 'youtube';
  videoId: string;
};

export type UploadVideoEmbedReference = {
  provider: 'upload';
  src: string;
};

export type VideoEmbedReference = UploadVideoEmbedReference | YoutubeVideoEmbedReference;

const escapeJsxAttribute = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

/**
 * Returns the first non-empty path segment from a pathname.
 *
 * @param pathname URL pathname string.
 * @returns The first path segment or null.
 */
const getFirstPathSegment = (pathname: string) =>
  pathname.split('/').find(segment => segment.length > 0) ?? null;

/**
 * Extracts a supported video reference from a user-provided URL.
 *
 * @param value Raw video URL string.
 * @returns A normalized video reference or null.
 */
export const extractVideoEmbedReference = (value: string): VideoEmbedReference | null => {
  const trimmedValue = value.trim();

  if (!trimmedValue) return null;

  try {
    const url = new URL(trimmedValue);
    const isYoutubeDomain = url.hostname === 'youtube.com' || url.hostname.endsWith('.youtube.com');

    if (url.hostname === 'youtu.be') {
      const videoId = getFirstPathSegment(url.pathname);

      return videoId
        ? {
            provider: 'youtube',
            videoId,
          }
        : null;
    }

    if (isYoutubeDomain) {
      if (url.pathname === '/watch') {
        const videoId = url.searchParams.get('v');

        return videoId
          ? {
              provider: 'youtube',
              videoId,
            }
          : null;
      }

      const [, firstSegment, secondSegment] = url.pathname.split('/');

      if (firstSegment === 'shorts' && secondSegment) {
        return {
          provider: 'youtube',
          videoId: secondSegment,
        };
      }

      if (firstSegment === 'embed' && secondSegment) {
        return {
          provider: 'youtube',
          videoId: secondSegment,
        };
      }
    }
  } catch {
    return null;
  }

  return null;
};

/**
 * Extracts only the YouTube video id from a supported URL.
 *
 * @param value Raw YouTube URL string.
 * @returns A YouTube video id or null.
 */
export const extractYoutubeId = (value: string) => {
  const reference = extractVideoEmbedReference(value);

  return reference?.provider === 'youtube' ? reference.videoId : null;
};

/**
 * Builds the custom Video markdown tag from a normalized reference.
 *
 * @param reference Video provider reference.
 * @returns A custom Video markdown string.
 */
export const createVideoEmbedMarkdown = (reference: VideoEmbedReference) => {
  if (reference.provider === 'upload') {
    return `<Video provider="upload" src="${escapeJsxAttribute(reference.src)}" />`;
  }

  return `<Video provider="${reference.provider}" id="${escapeJsxAttribute(reference.videoId)}" />`;
};

/**
 * Builds a Video markdown tag for a YouTube video id.
 *
 * @param videoId YouTube video id.
 * @returns A YouTube Video markdown string.
 */
export const createYoutubeEmbedMarkdown = (videoId: string) =>
  createVideoEmbedMarkdown({
    provider: 'youtube',
    videoId,
  });

/**
 * Builds a Video markdown tag for an uploaded video URL.
 *
 * @param src Public URL of the uploaded video.
 * @returns An upload Video markdown string.
 */
export const createUploadedVideoEmbedMarkdown = (src: string) =>
  createVideoEmbedMarkdown({
    provider: 'upload',
    src,
  });
