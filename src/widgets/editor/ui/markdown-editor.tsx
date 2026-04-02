'use client';

import React, { useMemo, useRef, useState } from 'react';
import { MarkdownHooks } from 'react-markdown';
import { css, cva, cx } from 'styled-system/css';

import type { MarkdownEditorHostAdapters } from '@/entities/editor-core';
import {
  applyTextareaTransform,
  continueMarkdownList,
  indentMarkdownList,
  insertTemplate,
  outdentMarkdownList,
} from '@/entities/editor-core';
import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import { buildEditorLinkInsertion } from '@/entities/editor-core/model/markdown-link';
import type { MarkdownToolbarUiRegistry } from '@/features/edit-markdown/model/markdown-toolbar.types';
import { MarkdownToolbar } from '@/features/edit-markdown/toolbar';
import { mediaQueryDown } from '@/shared/config/breakpoints';
import { collectMarkdownImages } from '@/shared/lib/markdown/collect-markdown-images';
import { getMarkdownOptions, markdownBodyClass } from '@/shared/lib/markdown/markdown-config';
import { renderRichMarkdown } from '@/shared/lib/markdown/rich-markdown';
import type { PartialRichMarkdownRendererRegistry } from '@/shared/lib/markdown/rich-markdown-renderers';
import { EditIcon, EyeIcon } from '@/shared/ui/icons/app-icons';
import { Textarea } from '@/shared/ui/textarea/textarea';

type MarkdownEditorProps = {
  adapters?: MarkdownEditorHostAdapters;
  className?: string;
  contentType: EditorContentType;
  locale?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  previewEmptyText?: string;
  renderers?: PartialRichMarkdownRendererRegistry;
  uiRegistry?: MarkdownToolbarUiRegistry;
  value: string;
};

type MobilePane = 'edit' | 'preview';

/**
 * Renders a textarea-based markdown editor with a toolbar and live preview.
 */
export const MarkdownEditor = ({
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
}: MarkdownEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [mobilePane, setMobilePane] = useState<MobilePane>('edit');
  const isMobileLayout = useMobileEditorLayout();
  const markdownOptions = useMemo(
    () =>
      getMarkdownOptions({
        adapters,
        items: collectMarkdownImages(value),
      }),
    [adapters, value],
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

      if (!nextValue) return;

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
    value.trim().length > 0 ? (
      <div className={markdownBodyClass}>
        {renderRichMarkdown({
          adapters,
          markdown: value,
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

  return (
    <section className={cx(rootClass, className)}>
      <div className={toolbarWrapClass}>
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

      <div className={bodyClass}>
        <section
          aria-label="Editor input"
          className={editorPaneClass}
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
          hidden={isMobileLayout && mobilePane !== 'preview'}
          id={isMobileLayout ? 'markdown-editor-pane-preview' : undefined}
          lang={locale}
        >
          {previewNode}
        </section>
      </div>
    </section>
  );
};

/**
 * Tracks whether the mobile editor layout should be active.
 */
const useMobileEditorLayout = () => {
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }

    return window.matchMedia(mediaQueryDown.md).matches;
  });

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

const rootClass = css({
  display: 'grid',
  gap: '4',
  minWidth: '0',
});

const toolbarWrapClass = css({
  minWidth: '0',
  overflowX: 'auto',
  overflowY: 'hidden',
});

const bodyClass = css({
  display: 'grid',
  gap: '4',
  minWidth: '0',
  gridTemplateColumns: {
    base: '1fr',
    md: 'repeat(2, minmax(0, 1fr))',
  },
});

const editorPaneClass = css({
  display: 'flex',
  minWidth: '0',
  minHeight: '0',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  borderRadius: '2xl',
  backgroundColor: 'surface',
  overflow: 'hidden',
  p: '4',
});

const previewPaneClass = css({
  minWidth: '0',
  minHeight: '0',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  borderRadius: '2xl',
  backgroundColor: 'surface',
  overflowY: 'auto',
  overscrollBehaviorY: 'contain',
  p: '4',
});

const editorTextareaClass = css({
  width: 'full',
  minHeight: '80',
  height: 'full',
  resize: 'none',
  overflowY: 'auto',
  overscrollBehaviorY: 'contain',
  fontFamily: 'mono',
});

const emptyPreviewClass = css({
  margin: '0',
  fontSize: 'sm',
  color: 'muted',
});

const mobilePaneTabListClass = css({
  display: {
    base: 'flex',
    md: 'none',
  },
  gap: '2',
});

const mobilePaneTabRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    minWidth: '0',
    flex: '1',
    borderRadius: 'full',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border',
    backgroundColor: 'surface',
    px: '4',
    py: '2.5',
    fontSize: 'sm',
    fontWeight: 'semibold',
    color: 'muted',
    transition: 'common',
  },
  variants: {
    active: {
      true: {
        borderColor: 'primary',
        color: 'text',
      },
      false: {},
    },
  },
});

const tabIconClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export type { MarkdownEditorProps };
