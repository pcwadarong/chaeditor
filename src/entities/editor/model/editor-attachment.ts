/**
 * Public metadata for an attachment embedded in editor content.
 *
 * @property contentType MIME type of the attachment.
 * @property fileName Original file name provided by the user.
 * @property fileSize Attachment size in bytes.
 * @property url Public or internal download URL for the attachment.
 */
export type EditorAttachment = {
  contentType: string;
  fileName: string;
  fileSize: number;
  url: string;
};
