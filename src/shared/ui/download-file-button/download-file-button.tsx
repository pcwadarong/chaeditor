import React from 'react';
import { css } from 'styled-system/css';

import { Button } from '@/shared/ui/button';

export type DownloadFileButtonProps = {
  /**
   * Download URL. When it is null, the button is rendered in a disabled state.
   */
  href: string | null;
  /**
   * Visible button label.
   */
  label: string;
  /**
   * Suggested file name forwarded to the browser download attribute.
   */
  fileName?: string;
};

/**
 * Renders a shared button for explicit file downloads.
 *
 * This component is intentionally download-focused. Use it when the primary user intent
 * is to save a file, not to open or preview it in a new tab.
 */
export const DownloadFileButton = ({ href, label, fileName }: DownloadFileButtonProps) => {
  const isDisabled = !href;

  if (href) {
    return (
      <Button asChild className={downloadButtonClass} tone="white" variant="solid">
        <a download={fileName} href={href}>
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Button
      aria-disabled={isDisabled}
      className={downloadButtonClass}
      disabled={isDisabled}
      tone="white"
      type="button"
      variant="solid"
    >
      {label}
    </Button>
  );
};

const downloadButtonClass = css({
  transition: '[transform 180ms ease]',
  _hover: {
    transform: 'translateY(-2px)',
    background: 'surface',
    borderColor: 'borderStrong',
  },
  _active: {
    transform: 'translateY(1px)',
  },
});
