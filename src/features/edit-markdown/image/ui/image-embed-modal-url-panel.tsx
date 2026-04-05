'use client';

import React from 'react';

import {
  fieldLabelClass,
  headerButtonGroupClass,
  metaTextClass,
  urlPanelActionRowClass,
  urlPanelClass,
} from '@/features/edit-markdown/image/ui/image-embed-modal.panda';
import { useMarkdownPrimitives } from '@/shared/ui/primitive-registry/markdown-primitive-registry';

type ImageEmbedModalUrlPanelProps = {
  isAddDisabled: boolean;
  onAdd: () => void;
  onCancel: () => void;
  onChange: (value: string) => void;
  pendingUrls: string;
};

/**
 * Renders the supplemental URL entry panel used in the populated modal state.
 *
 * @param props URL panel value and action handlers.
 * @returns The URL panel section.
 */
export const ImageEmbedModalUrlPanel = ({
  isAddDisabled,
  onAdd,
  onCancel,
  onChange,
  pendingUrls,
}: ImageEmbedModalUrlPanelProps) => {
  const { Button, Textarea } = useMarkdownPrimitives();

  return (
    <section className={urlPanelClass}>
      <label className={fieldLabelClass} htmlFor="markdown-toolbar-image-url-panel">
        Add web URLs
      </label>
      <Textarea
        autoResize={false}
        id="markdown-toolbar-image-url-panel"
        onChange={event => onChange(event.target.value)}
        placeholder={`https://example.com/image.png\nhttps://example.com/image-2.png`}
        rows={3}
        value={pendingUrls}
      />
      <div className={urlPanelActionRowClass}>
        <p className={metaTextClass}>Enter one URL per line.</p>
        <div className={headerButtonGroupClass}>
          <Button onClick={onCancel} size="sm" tone="white" variant="ghost">
            Cancel
          </Button>
          <Button disabled={isAddDisabled} onClick={onAdd} size="sm" tone="white">
            Add
          </Button>
        </div>
      </div>
    </section>
  );
};
