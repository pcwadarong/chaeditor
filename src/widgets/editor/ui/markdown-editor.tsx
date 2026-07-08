'use client';

import React, { useMemo, useRef, useState } from 'react';
import { MarkdownHooks } from 'react-markdown';
import { cx } from 'styled-system/css';

import type { MarkdownEditorHostAdapters } from '@/entities/editor-core';
import {
  applyTextareaTransform,
  continueMarkdownList,
  indentMarkdownList,
  insertTemplate,
  outdentMarkdownList,
} from '@/entities/editor-core';
import { collectMarkdownImages } from '@/entities/editor-core/model/collect-markdown-images';
import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import { buildEditorLinkInsertion } from '@/entities/editor-core/model/markdown-link';
import type { MarkdownToolbarUiRegistry } from '@/features/edit-markdown/toolbar';
import { MarkdownToolbar } from '@/features/edit-markdown/toolbar';
import { mediaQueryDown } from '@/shared/config/breakpoints';
import { getMarkdownOptions } from '@/shared/lib/markdown/markdown-config';
import { markdownBodyClass } from '@/shared/lib/markdown/markdown-styles.panda';
import { renderRichMarkdown } from '@/shared/lib/markdown/rich-markdown';
import type { PartialRichMarkdownRendererRegistry } from '@/shared/lib/markdown/rich-markdown-renderers';
import { EditIcon, EyeIcon } from '@/shared/ui/icons/app-icons';
import type { MarkdownPrimitiveRegistry } from '@/shared/ui/primitive-registry/markdown-primitive-contract';
import {
  MarkdownPrimitiveProvider,
  useMarkdownPrimitives,
} from '@/shared/ui/primitive-registry/markdown-primitive-registry';
import {
  bodyClass,
  editorPaneClass,
  editorTextareaClass,
  emptyPreviewClass,
  mobilePaneTabListClass,
  mobilePaneTabRecipe,
  previewPaneClass,
  rootClass,
  tabIconClass,
  toolbarWrapClass,
} from '@/widgets/editor/ui/markdown-editor.panda';

type MarkdownEditorProps = {
  adapters?: MarkdownEditorHostAdapters;
  className?: string;
  contentType: EditorContentType;
  locale?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  previewEmptyText?: string;
  primitiveRegistry?: MarkdownPrimitiveRegistry;
  renderers?: PartialRichMarkdownRendererRegistry;
  uiRegistry?: MarkdownToolbarUiRegistry;
  value: string;
};

type MobilePane = 'edit' | 'preview';

type MarkdownEditorBodyProps = Omit<MarkdownEditorProps, 'primitiveRegistry'>;

/**
 * Renders the editor body. Kept as a separate component so it resolves
 * `useMarkdownPrimitives()` inside the provider that `MarkdownEditor` renders,
 * ensuring a host `primitiveRegistry` also applies to the main textarea — not
 * only to the toolbar popovers.
 */
const MarkdownEditorBody = ({
  adapters,
  className,
  contentType,
  locale,
  onChange,
  placeholder = 'Write markdown content',
  previewEmptyText = 'Nothing to preview yet.',
  renderers,
  uiRegistry,
  value,
}: MarkdownEditorBodyProps) => {
  const { Textarea } = useMarkdownPrimitives();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [mobilePane, setMobilePane] = useState<MobilePane>('edit');
  const isMobileLayout = useMobileEditorLayout();
  const deferredValue = React.useDeferredValue(value);
  const markdownOptions = useMemo(
    () =>
      getMarkdownOptions({
        adapters,
        items: collectMarkdownImages(deferredValue),
      }),
    [adapters, deferredValue],
  );

  /**
   * Applies a textarea transform and forwards the next value through onChange.
   */
  const applyTransform = (transform: (textarea: HTMLTextAreaElement) => string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    applyTextareaTransform(textarea, onChange, transform);
  };

  /**
   * Converts pasted URLs into markdown link syntax when text is selected.
   */
  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const selectedText = value.slice(
      event.currentTarget.selectionStart,
      event.currentTarget.selectionEnd,
    );
    const insertion = buildEditorLinkInsertion({
      clipboardText: event.clipboardData.getData('text'),
      selectedText,
    });

    if (!insertion) return;

    event.preventDefault();
    applyTransform(textarea => insertTemplate(textarea, insertion.text, insertion.text.length));
  };

  /**
   * Preserves Enter and Tab helpers for markdown list editing.
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      const nextValue = continueMarkdownList(event.currentTarget);

      if (nextValue === null) return;

      event.preventDefault();
      applyTransform(() => nextValue);
      return;
    }

    if (event.key !== 'Tab') return;

    const nextValue = event.shiftKey
      ? outdentMarkdownList(event.currentTarget)
      : indentMarkdownList(event.currentTarget);

    if (!nextValue) return;

    event.preventDefault();
    applyTransform(() => nextValue);
  };

  const previewNode =
    deferredValue.trim().length > 0 ? (
      <div className={markdownBodyClass}>
        {renderRichMarkdown({
          adapters,
          markdown: deferredValue,
          renderMarkdownFragment: (fragmentMarkdown, key) => (
            <MarkdownHooks key={key} {...markdownOptions}>
              {fragmentMarkdown}
            </MarkdownHooks>
          ),
          renderers,
        })}
      </div>
    ) : (
      <p className={emptyPreviewClass}>{previewEmptyText}</p>
    );

  const editorNode = (
    <section className={cx(rootClass, className)} data-slot="root">
      <div className={toolbarWrapClass} data-slot="toolbar-wrap">
        <MarkdownToolbar
          adapters={adapters}
          contentType={contentType}
          onChange={onChange}
          textareaRef={textareaRef}
          uiRegistry={uiRegistry}
        />
      </div>

      {isMobileLayout ? (
        <div aria-label="Editor panel selection" className={mobilePaneTabListClass} role="tablist">
          <button
            aria-controls="markdown-editor-pane-edit"
            aria-selected={mobilePane === 'edit'}
            className={mobilePaneTabRecipe({ active: mobilePane === 'edit' })}
            onClick={() => setMobilePane('edit')}
            role="tab"
            type="button"
          >
            <span aria-hidden className={tabIconClass}>
              <EditIcon color="current" size="sm" />
            </span>
            Edit
          </button>
          <button
            aria-controls="markdown-editor-pane-preview"
            aria-selected={mobilePane === 'preview'}
            className={mobilePaneTabRecipe({ active: mobilePane === 'preview' })}
            onClick={() => setMobilePane('preview')}
            role="tab"
            type="button"
          >
            <span aria-hidden className={tabIconClass}>
              <EyeIcon color="current" size="sm" />
            </span>
            Preview
          </button>
        </div>
      ) : null}

      <div className={bodyClass} data-slot="body">
        <section
          aria-label="Editor input"
          className={editorPaneClass}
          data-slot="editor-pane"
          hidden={isMobileLayout && mobilePane !== 'edit'}
          id={isMobileLayout ? 'markdown-editor-pane-edit' : undefined}
        >
          <Textarea
            aria-label="Markdown editor input"
            autoResize={false}
            className={editorTextareaClass}
            onChange={event => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            ref={textareaRef}
            rows={18}
            value={value}
          />
        </section>

        <section
          aria-label="Markdown preview"
          className={previewPaneClass}
          data-slot="preview-pane"
          hidden={isMobileLayout && mobilePane !== 'preview'}
          id={isMobileLayout ? 'markdown-editor-pane-preview' : undefined}
          lang={locale}
        >
          {previewNode}
        </section>
      </div>
    </section>
  );

  return editorNode;
};

/**
 * Renders a textarea-based markdown editor with a toolbar and live preview.
 *
 * When a `primitiveRegistry` is provided, the whole body (including the main
 * textarea) is rendered inside a `MarkdownPrimitiveProvider`. When it is not,
 * the body inherits any ambient primitive context so a host-level provider
 * still applies.
 */
export const MarkdownEditor = ({ primitiveRegistry, ...bodyProps }: MarkdownEditorProps) => {
  const body = <MarkdownEditorBody {...bodyProps} />;

  return primitiveRegistry ? (
    <MarkdownPrimitiveProvider registry={primitiveRegistry}>{body}</MarkdownPrimitiveProvider>
  ) : (
    body
  );
};

/**
 * Tracks whether the mobile editor layout should be active.
 */
const useMobileEditorLayout = () => {
  // Always start from `false` so the server render and the first client render
  // agree; the layout effect below flips it to the real value after hydration.
  const [isMobile, setIsMobile] = React.useState(false);

  React.useLayoutEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQueryList = window.matchMedia(mediaQueryDown.md);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, []);

  return isMobile;
};

export type { MarkdownEditorProps };
