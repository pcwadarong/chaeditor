// @vitest-environment node

import {
  createUploadedVideoEmbedMarkdown,
  createVideoEmbedMarkdown,
  createYoutubeEmbedMarkdown,
  extractVideoEmbedReference,
  extractYoutubeId,
} from '@/entities/editor-core/model/video-embed';

describe('video embed helpers', () => {
  it('Under a valid YouTube URL, extractVideoEmbedReference must return the provider and video id', () => {
    expect(extractVideoEmbedReference('  https://youtu.be/dQw4w9WgXcQ  ')).toEqual({
      provider: 'youtube',
      videoId: 'dQw4w9WgXcQ',
    });
    expect(extractVideoEmbedReference('https://youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      provider: 'youtube',
      videoId: 'dQw4w9WgXcQ',
    });
    expect(
      extractVideoEmbedReference('https://www.youtube.com/shorts/dQw4w9WgXcQ?feature=share'),
    ).toEqual({
      provider: 'youtube',
      videoId: 'dQw4w9WgXcQ',
    });
  });

  it('Under invalid input, extractVideoEmbedReference must return null', () => {
    expect(extractVideoEmbedReference('')).toBeNull();
    expect(extractVideoEmbedReference('not-a-url')).toBeNull();
    expect(extractVideoEmbedReference('https://notyoutube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
  });

  it('Under a valid YouTube URL, extractYoutubeId must return only the video id', () => {
    expect(extractYoutubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('Under a provider and video id, createVideoEmbedMarkdown must return Video syntax with provider data', () => {
    expect(
      createVideoEmbedMarkdown({
        provider: 'youtube',
        videoId: 'dQw4w9WgXcQ',
      }),
    ).toBe('<Video provider="youtube" id="dQw4w9WgXcQ" />');
  });

  it('Under a valid YouTube id, createYoutubeEmbedMarkdown must return Video syntax with the YouTube provider', () => {
    expect(createYoutubeEmbedMarkdown('abc"def')).toBe(
      '<Video provider="youtube" id="abc&quot;def" />',
    );
  });

  it('Under an uploaded video URL, createUploadedVideoEmbedMarkdown must return upload provider syntax', () => {
    expect(createUploadedVideoEmbedMarkdown('https://example.com/videos/demo.mp4')).toBe(
      '<Video provider="upload" src="https://example.com/videos/demo.mp4" />',
    );
  });
});
