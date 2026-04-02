/**
 * Supported insertion modes for link helpers.
 */
export type LinkEmbedMode = 'card' | 'link' | 'preview';

/**
 * Label overrides for the built-in link embed popover.
 */
export type LinkEmbedPopoverLabels = {
  cardButtonLabel: string;
  panelLabel: string;
  previewButtonLabel: string;
  triggerAriaLabel: string;
  triggerTooltip: string;
  urlInputAriaLabel: string;
  urlPlaceholder: string;
  hyperlinkButtonLabel: string;
};
