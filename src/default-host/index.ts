/**
 * Default host adapter entrypoint.
 *
 * This surface is intentionally exposed as an optional subpath instead of part of the
 * main package root so consumers can opt into the network-coupled defaults explicitly.
 */
export {
  uploadEditorFile,
  uploadEditorImage,
  uploadEditorVideo,
} from '@/integrations/default-host';
