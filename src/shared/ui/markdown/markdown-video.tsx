import React from 'react';
import { css } from 'styled-system/css';

type MarkdownVideoProps = {
  provider: 'upload' | 'youtube';
  src?: string;
  videoId?: string;
};

const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/**
 * Renders custom markdown video syntax for the supported providers.
 *
 * @param props Provider-specific video values. `youtube` uses `videoId`, `upload` uses `src`.
 * @returns The rendered video block for the provider.
 */
export const MarkdownVideo = ({ provider, src, videoId }: MarkdownVideoProps) => {
  if (provider === 'upload' && src) {
    return (
      <div className={videoFrameClass}>
        <video className={videoElementClass} controls preload="metadata" src={src} />
      </div>
    );
  }

  if (provider !== 'youtube' || !videoId || !YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) return null;

  return (
    <div className={videoFrameClass}>
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className={videoIframeClass}
        referrerPolicy="strict-origin-when-cross-origin"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
      />
    </div>
  );
};

const videoFrameClass = css({
  position: 'relative',
  width: 'full',
  overflow: 'hidden',
  borderRadius: 'xl',
  border: '[1px solid var(--colors-border)]',
  background: 'surfaceMuted',
  pt: '[56.25%]',
});

const videoIframeClass = css({
  position: 'absolute',
  inset: '0',
  width: 'full',
  height: 'full',
  border: '[0]',
});

const videoElementClass = css({
  position: 'absolute',
  inset: '0',
  width: 'full',
  height: 'full',
  objectFit: 'contain',
  background: 'black',
});
