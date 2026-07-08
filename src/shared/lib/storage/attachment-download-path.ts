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
 *
 * @param href The stored attachment URL.
 * @param supabaseBaseUrl The Supabase project URL. Defaults to
 *   `NEXT_PUBLIC_SUPABASE_URL` so this stays usable without the Next.js env var
 *   when a host passes the value explicitly.
 */
export const parseAttachmentStoragePath = (
  href: string,
  supabaseBaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL,
): AttachmentStorageLocation | null => {
  const supabaseUrl = supabaseBaseUrl?.trim();
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

    const filePath = decodeURIComponent(encodedAttachmentPath);

    // Reject path traversal so a crafted URL cannot escape the attachments
    // prefix once the decoded path is forwarded to the download route.
    if (filePath.split('/').includes('..')) return null;

    return {
      bucketName,
      filePath,
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
  supabaseBaseUrl,
}: {
  fileName: string;
  href: string;
  supabaseBaseUrl?: string;
}) => {
  const storageLocation = parseAttachmentStoragePath(href, supabaseBaseUrl);
  if (!storageLocation) return href;

  return buildAttachmentDownloadPath({
    bucketName: storageLocation.bucketName,
    fileName,
    filePath: storageLocation.filePath,
  });
};
