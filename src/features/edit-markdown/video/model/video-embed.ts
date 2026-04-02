/**
 * Re-exports the video embed helpers from editor-core for backward-compatible imports.
 */
export type {
  UploadVideoEmbedReference,
  VideoEmbedReference,
  VideoProvider,
  YoutubeVideoEmbedReference,
} from '@/entities/editor-core/model/video-embed';
export {
  createUploadedVideoEmbedMarkdown,
  createVideoEmbedMarkdown,
  createYoutubeEmbedMarkdown,
  extractVideoEmbedReference,
  extractYoutubeId,
} from '@/entities/editor-core/model/video-embed';
