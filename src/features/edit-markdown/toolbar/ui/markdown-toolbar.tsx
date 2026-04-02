'use client';

import React from 'react';
import { css } from 'styled-system/css';

import type {
  MarkdownToolbarProps,
  ToolbarActionItem,
  ToolbarSectionItem,
} from '@/features/edit-markdown/model/markdown-toolbar.types';
import { useMarkdownToolbar } from '@/features/edit-markdown/model/use-markdown-toolbar';
import { ToolbarActionButton } from '@/features/edit-markdown/toolbar/ui/toolbar-action-button';

/**
 * Renders the markdown formatting toolbar for a textarea editor.
 */
export const MarkdownToolbar = ({
  adapters,
  contentType,
  onChange,
  textareaRef,
  uiRegistry,
}: MarkdownToolbarProps) => {
  const { toolbarSections } = useMarkdownToolbar({
    adapters,
    contentType,
    onChange,
    popoverTriggerClassName: popoverTriggerResetClass,
    textareaRef,
    uiRegistry,
  });

  return (
    <div aria-label="Markdown formatting tools" className={toolbarClass} role="toolbar">
      {toolbarSections.map((section, index) => (
        <React.Fragment key={section.key}>
          <div className={groupClass}>
            {section.items.map(item => renderToolbarSectionItem(item))}
          </div>
          {index < toolbarSections.length - 1 ? (
            <div aria-hidden className={separatorClass} />
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
};

/**
 * Renders a standard toolbar action as a compact button.
 */
const renderActionButton = (action: ToolbarActionItem) => (
  <ToolbarActionButton ariaLabel={action.label} key={action.key} onClick={action.onClick}>
    {action.token ? <span className={tokenClass}>{action.token}</span> : action.icon}
  </ToolbarActionButton>
);

/**
 * Renders either a toolbar action button or a custom node for a section item.
 */
const renderToolbarSectionItem = (item: ToolbarSectionItem) =>
  item.type === 'action' ? (
    renderActionButton(item.action)
  ) : (
    <React.Fragment key={item.key}>{item.node}</React.Fragment>
  );

const toolbarClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  overflowX: 'auto',
  width: 'full',
  pb: '3',
  flexWrap: 'nowrap',
  scrollbarWidth: '[thin]',
});

const groupClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2',
  flex: 'none',
});

const separatorClass = css({
  width: '[1px]',
  minHeight: '7',
  backgroundColor: 'border',
  flex: 'none',
});

const tokenClass = css({
  fontSize: 'xs',
  fontWeight: 'bold',
  letterSpacing: '[-0.02em]',
});

const popoverTriggerResetClass = css({
  border: '[0]',
  p: '0',
});
