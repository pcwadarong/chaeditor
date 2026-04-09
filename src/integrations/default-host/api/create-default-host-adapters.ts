import type { MarkdownEditorHostAdapters } from '@/entities/editor-core/model/host-adapters';
import { createFetchLinkPreviewMeta } from '@/integrations/default-host/api/fetch-link-preview-meta';
import { uploadEditorFile } from '@/integrations/default-host/api/upload-editor-file';
import { uploadEditorImage } from '@/integrations/default-host/api/upload-editor-image';
import { uploadEditorVideo } from '@/integrations/default-host/api/upload-editor-video';

type CreateDefaultHostAdaptersOptions = {
  linkPreviewEndpoint?: string;
  linkPreviewHeaders?: HeadersInit;
  linkPreviewFetchFn?: typeof fetch;
};

/**
 * Creates the package-default host adapter set.
 *
 * Upload adapters use the packaged route convention:
 * - `/api/attachments`
 * - `/api/images`
 * - `/api/videos`
 *
 * Link preview metadata defaults to `/api/link-preview` and can be overridden.
 */
export const createDefaultHostAdapters = ({
  linkPreviewEndpoint,
  linkPreviewFetchFn,
  linkPreviewHeaders,
}: CreateDefaultHostAdaptersOptions = {}): MarkdownEditorHostAdapters => ({
  fetchLinkPreviewMeta: createFetchLinkPreviewMeta({
    endpoint: linkPreviewEndpoint,
    fetchFn: linkPreviewFetchFn,
    headers: linkPreviewHeaders,
  }),
  uploadFile: uploadEditorFile,
  uploadImage: uploadEditorImage,
  uploadVideo: uploadEditorVideo,
});
