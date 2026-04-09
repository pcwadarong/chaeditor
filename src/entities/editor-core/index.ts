export type { EditorContentType } from '@/entities/editor-core/model/content-types';
export type { EditorAttachment } from '@/entities/editor-core/model/editor-attachment';
export {
  EDITOR_ATTACHMENT_FILE_INPUT_ACCEPT,
  EDITOR_ATTACHMENT_MAX_FILE_SIZE,
  isAllowedEditorAttachmentExtension,
  isAllowedEditorAttachmentFile,
} from '@/entities/editor-core/model/editor-attachment-policy';
export {
  EDITOR_VIDEO_FILE_INPUT_ACCEPT,
  EDITOR_VIDEO_MAX_FILE_SIZE,
  isAllowedEditorVideoExtension,
  isAllowedEditorVideoFile,
} from '@/entities/editor-core/model/editor-video-policy';
export type {
  FetchLinkPreviewMeta,
  HostImageRenderer,
  HostImageRenderProps,
  MarkdownEditorHostAdapters,
  MarkdownImageViewerLabels,
  MarkdownRendererHostAdapters,
  PreviewImageSource,
  ResolveAttachmentHref,
  UploadEditorFile,
  UploadEditorImage,
  UploadEditorVideo,
} from '@/entities/editor-core/model/host-adapters';
export {
  normalizeMarkdownHtmlAliases,
  preprocessMarkdownInlineSyntax,
  transformMarkdownOutsideCode,
} from '@/entities/editor-core/model/markdown-inline';
export type { EditorLinkMode } from '@/entities/editor-core/model/markdown-link';
export {
  buildEditorLinkInsertion,
  createMarkdownLink,
  createMarkdownLinkByMode,
} from '@/entities/editor-core/model/markdown-link';
export type {
  MarkdownSegment,
  RichMarkdownRenderArgs,
} from '@/entities/editor-core/model/markdown-segments';
export {
  decodeHtmlAttributeEntities,
  parseRichMarkdownSegments,
  parseToggleTitle,
} from '@/entities/editor-core/model/markdown-segments';
export {
  createAlignBlockMarkdown,
  createAttachmentEmbedMarkdown,
  createImageEmbedMarkdown,
  createImageEmbedMarkdownGroup,
  createImageGalleryMarkdown,
  createMathEmbedMarkdown,
  createToggleBlockMarkdown,
  createUploadedVideoEmbedMarkdown,
  createVideoEmbedMarkdown,
  createYoutubeEmbedMarkdown,
  extractVideoEmbedReference,
  extractYoutubeId,
} from '@/entities/editor-core/model/markdown-templates';
export {
  applyTextareaTransform,
  continueMarkdownList,
  focusTextarea,
  getPendingSelection,
  indentMarkdownList,
  insertTemplate,
  outdentMarkdownList,
  prefixLine,
  restoreCursor,
  toggleHeadingLine,
  wrapSelection,
} from '@/entities/editor-core/model/selection-utils';
export type {
  ChaeditorThemeDefinition,
  ChaeditorThemeVariableName,
} from '@/entities/editor-core/model/theme-contract';
export {
  CHAEDITOR_THEME_DEFAULTS,
  CHAEDITOR_THEME_VARIABLES,
  createChaeditorThemeVars,
} from '@/entities/editor-core/model/theme-contract';
export type {
  MarkdownToolbarPresetItemKey,
  MarkdownToolbarPresetSection,
  MarkdownToolbarResolvedSection,
  MarkdownToolbarSectionKey,
} from '@/entities/editor-core/model/toolbar-preset';
export {
  DEFAULT_MARKDOWN_TOOLBAR_PRESET,
  resolveMarkdownToolbarPresetSections,
} from '@/entities/editor-core/model/toolbar-preset';
export type {
  UploadVideoEmbedReference,
  VideoEmbedReference,
  VideoProvider,
  YoutubeVideoEmbedReference,
} from '@/entities/editor-core/model/video-embed';
export type { LinkEmbedData } from '@/shared/lib/markdown/link-embed';
export { extractEmbedMetaFromHtml } from '@/shared/lib/markdown/link-embed';
