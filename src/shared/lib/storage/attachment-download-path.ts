import {
  type EditorContentStorageBucket,
  isEditorContentStorageBucket,
} from '@/shared/lib/storage/storage-path';

const SUPABASE_PUBLIC_STORAGE_PREFIX = '/storage/v1/object/public/';

type AttachmentStorageLocation = {
  bucketName: EditorContentStorageBucket;
  filePath: string;
};

const ATTACHMENT_PATH_PREFIX = 'attachments/';

/**
 * Builds an internal attachment download path for the current origin.
 */
export const buildAttachmentDownloadPath = ({
  bucketName,
  fileName,
  filePath,
}: {
  bucketName: AttachmentStorageLocation['bucketName'];
  fileName: string;
  filePath: string;
}) => {
  const searchParams = new URLSearchParams({
    bucket: bucketName,
    fileName,
    path: `${ATTACHMENT_PATH_PREFIX}${filePath}`,
  });

  return `/api/attachments/download?${searchParams.toString()}`;
};

/**
 * Extracts the attachment storage location from a Supabase public URL.
 */
export const parseAttachmentStoragePath = (href: string): AttachmentStorageLocation | null => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) return null;

  try {
    const parsedHref = new URL(href);
    const parsedSupabaseUrl = new URL(supabaseUrl);

    if (parsedHref.origin !== parsedSupabaseUrl.origin) return null;

    const storagePrefix = `${SUPABASE_PUBLIC_STORAGE_PREFIX}`;
    if (!parsedHref.pathname.startsWith(storagePrefix)) return null;

    const encodedStoragePath = parsedHref.pathname.slice(storagePrefix.length);
    const [bucketName, ...encodedFilePathSegments] = encodedStoragePath.split('/');
    const encodedFilePath = encodedFilePathSegments.join('/');

    if (!bucketName || !encodedFilePath) return null;

    if (!isEditorContentStorageBucket(bucketName)) return null;
    if (!encodedFilePath.startsWith(ATTACHMENT_PATH_PREFIX)) return null;

    const encodedAttachmentPath = encodedFilePath.slice(ATTACHMENT_PATH_PREFIX.length);
    if (!encodedAttachmentPath) return null;

    return {
      bucketName,
      filePath: decodeURIComponent(encodedAttachmentPath),
    };
  } catch {
    return null;
  }
};

/**
 * Rewrites a Supabase attachment URL to the internal download route.
 */
export const resolveAttachmentDownloadHref = ({
  fileName,
  href,
}: {
  fileName: string;
  href: string;
}) => {
  const storageLocation = parseAttachmentStoragePath(href);
  if (!storageLocation) return href;

  return buildAttachmentDownloadPath({
    bucketName: storageLocation.bucketName,
    fileName,
    filePath: storageLocation.filePath,
  });
};
