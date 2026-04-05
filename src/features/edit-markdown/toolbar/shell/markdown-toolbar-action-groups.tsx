import React from 'react';

import type { ToolbarActionItem } from '@/features/edit-markdown/toolbar/contracts/markdown-toolbar.types';
import {
  CodeBlockIcon,
  DashIcon,
  MarkDownBoldIcon,
  MarkDownItalicIcon,
  MarkDownStrikeIcon,
  MarkDownUnderlineIcon,
  QuoteIcon,
  SpoilerIcon,
  SubtextIcon,
  TableIcon,
} from '@/shared/ui/icons/app-icons';

const tableTemplate = [
  '| Heading1 | Heading2 | Heading3 |',
  '|-------|-------|-------|',
  '| Cell 1   | Cell 2   | Cell 3   |',
].join('\n');

type ApplyHeading = (level: 1 | 2 | 3 | 4) => void;
type ApplyPrefix = (prefix: string) => void;
type ApplyTemplate = (template: string, cursorOffset?: number) => void;
type ApplyWrap = (before: string, after: string, placeholder?: string) => void;
type ApplyToggle = (level: 1 | 2 | 3 | 4) => void;

/**
 * Returns the heading token actions for the toolbar.
 */
export const createHeadingActions = (applyHeading: ApplyHeading): ToolbarActionItem[] => [
  { key: 'heading-1', label: 'Heading 1', onClick: () => applyHeading(1), token: 'H1' },
  { key: 'heading-2', label: 'Heading 2', onClick: () => applyHeading(2), token: 'H2' },
  { key: 'heading-3', label: 'Heading 3', onClick: () => applyHeading(3), token: 'H3' },
  { key: 'heading-4', label: 'Heading 4', onClick: () => applyHeading(4), token: 'H4' },
];

/**
 * Returns the inline formatting actions for the toolbar.
 */
export const createInlineFormatActions = (applyWrap: ApplyWrap): ToolbarActionItem[] => [
  {
    icon: <MarkDownBoldIcon aria-hidden color="current" size="sm" />,
    key: 'bold',
    label: 'Bold',
    onClick: () => applyWrap('**', '**', 'Bold'),
  },
  {
    icon: <MarkDownItalicIcon aria-hidden color="current" size="sm" />,
    key: 'italic',
    label: 'Italic',
    onClick: () => applyWrap('*', '*', 'Italic'),
  },
  {
    icon: <MarkDownStrikeIcon aria-hidden color="current" size="sm" />,
    key: 'strike',
    label: 'Strikethrough',
    onClick: () => applyWrap('~~', '~~', 'Strikethrough'),
  },
  {
    icon: <MarkDownUnderlineIcon aria-hidden color="current" size="sm" />,
    key: 'underline',
    label: 'Underline',
    onClick: () => applyWrap('<u>', '</u>', 'Underline'),
  },
];

/**
 * Returns the text-structure actions for the toolbar.
 */
export const createTextStructureActions = (applyPrefix: ApplyPrefix): ToolbarActionItem[] => [
  {
    icon: <SubtextIcon aria-hidden color="current" size="sm" />,
    key: 'subtext',
    label: 'Subtext',
    onClick: () => applyPrefix('-# '),
  },
];

/**
 * Returns the block-level syntax actions for the toolbar.
 */
export const createBlockSyntaxActions = ({
  applyPrefix,
  applyTemplate,
  applyWrap,
}: {
  applyPrefix: ApplyPrefix;
  applyTemplate: ApplyTemplate;
  applyWrap: ApplyWrap;
}): ToolbarActionItem[] => [
  {
    icon: <DashIcon aria-hidden color="current" size="sm" />,
    key: 'horizontal-rule',
    label: 'Divider',
    onClick: () => applyTemplate('\n---\n'),
  },
  {
    icon: <QuoteIcon aria-hidden color="current" size="sm" />,
    key: 'quote',
    label: 'Quote',
    onClick: () => applyPrefix('> '),
  },
  {
    icon: <CodeBlockIcon aria-hidden color="current" size="sm" />,
    key: 'code-block',
    label: 'Code block',
    onClick: () => applyWrap('```ts\n', '\n```', 'Enter code here'),
  },
  {
    icon: <TableIcon aria-hidden color="current" size="sm" />,
    key: 'table',
    label: 'Table',
    onClick: () => applyTemplate(tableTemplate, 2),
  },
  {
    icon: <SpoilerIcon aria-hidden color="current" size="sm" />,
    key: 'spoiler',
    label: 'Spoiler',
    onClick: () => applyWrap('||', '||', 'Spoiler'),
  },
];

/**
 * Returns the toggle token actions for the toolbar.
 */
export const createToggleActions = (applyToggle: ApplyToggle): ToolbarActionItem[] => [
  {
    key: 'toggle-1',
    label: 'Toggle Heading 1',
    onClick: () => applyToggle(1),
    token: 'T1',
  },
  {
    key: 'toggle-2',
    label: 'Toggle Heading 2',
    onClick: () => applyToggle(2),
    token: 'T2',
  },
  {
    key: 'toggle-3',
    label: 'Toggle Heading 3',
    onClick: () => applyToggle(3),
    token: 'T3',
  },
  {
    key: 'toggle-4',
    label: 'Toggle Heading 4',
    onClick: () => applyToggle(4),
    token: 'T4',
  },
];
