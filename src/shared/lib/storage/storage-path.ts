/**
 * Storage bucket names used by each domain.
 */
export const STORAGE_BUCKET = {
  photo: 'photo',
  resume: 'resume',
  project: 'project',
  article: 'article',
} as const;

export type StorageBucket = (typeof STORAGE_BUCKET)[keyof typeof STORAGE_BUCKET];

/**
 * Storage directory names used for editor content assets.
 */
export const STORAGE_DIRECTORY = {
  attachments: 'attachments',
  images: 'images',
  pdf: 'pdf',
  thumbnails: 'thumbnails',
  videos: 'videos',
} as const;

export type StorageDirectory = (typeof STORAGE_DIRECTORY)[keyof typeof STORAGE_DIRECTORY];

export const CONTENT_STORAGE_DIRECTORIES = [
  STORAGE_DIRECTORY.attachments,
  STORAGE_DIRECTORY.images,
  STORAGE_DIRECTORY.pdf,
  STORAGE_DIRECTORY.thumbnails,
  STORAGE_DIRECTORY.videos,
] as const;

export type ContentStorageDirectory = (typeof CONTENT_STORAGE_DIRECTORIES)[number];

export const CONTENT_STORAGE_BUCKETS = [
  STORAGE_BUCKET.article,
  STORAGE_BUCKET.project,
  STORAGE_BUCKET.resume,
] as const;

export type ContentStorageBucket = (typeof CONTENT_STORAGE_BUCKETS)[number];
/**
 * Editor-specific content bucket type.
 */
export type EditorContentStorageBucket = ContentStorageBucket;

/**
 * Checks whether a bucket is valid for editor content assets.
 */
export const isEditorContentStorageBucket = (value: string): value is EditorContentStorageBucket =>
  CONTENT_STORAGE_BUCKETS.includes(value as EditorContentStorageBucket);

/**
 * Returns the storage bucket for an editor content type.
 */
export const resolveEditorContentStorageBucket = (
  contentType: EditorContentStorageBucket,
): EditorContentStorageBucket => contentType;

/**
 * Creates a storage object path for a content bucket directory.
 */
export const createContentStoragePath = (
  directory: ContentStorageDirectory,
  fileName: string,
): string => createStoragePath(directory, fileName);

/**
 * Safely joins path segments into a storage object path.
 */
export const createStoragePath = (...segments: string[]): string =>
  segments
    .map(segment => segment.trim().replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
