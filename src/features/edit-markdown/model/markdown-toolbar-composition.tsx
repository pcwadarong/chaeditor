import {
  type MarkdownToolbarPresetItemKey,
  type MarkdownToolbarPresetSection,
  resolveMarkdownToolbarPresetSections,
} from '@/entities/editor-core/model/toolbar-preset';
import type {
  ToolbarActionItem,
  ToolbarCustomItem,
  ToolbarSection,
  ToolbarSectionItem,
  ToolbarTokenOption,
} from '@/features/edit-markdown/model/markdown-toolbar.types';

type CreateMarkdownToolbarSectionsArgs = {
  itemRegistry: Partial<Record<MarkdownToolbarPresetItemKey, ToolbarSectionItem>>;
  preset?: MarkdownToolbarPresetSection[];
};

/**
 * Converts token-based toolbar actions into popover option objects.
 *
 * @param actions Toolbar actions with tokens.
 * @returns Token popover options.
 */
export const createToolbarTokenOptions = (actions: ToolbarActionItem[]): ToolbarTokenOption[] =>
  actions.map(action => ({
    key: action.key,
    label: action.label,
    onClick: action.onClick,
    token: action.token ?? '',
  }));

/**
 * Wraps plain toolbar actions into section items.
 *
 * @param actions Toolbar actions for the same section.
 * @returns Toolbar section items.
 */
export const createToolbarActionItems = (actions: ToolbarActionItem[]): ToolbarSectionItem[] =>
  actions.map(action => ({
    action,
    key: action.key,
    type: 'action',
  }));

/**
 * Wraps a custom node into the toolbar section item contract.
 *
 * @param key Toolbar item key.
 * @param node Custom node rendered inside the toolbar.
 * @returns A custom toolbar section item.
 */
export const createToolbarCustomItem = (
  key: MarkdownToolbarPresetItemKey,
  node: React.ReactNode,
): ToolbarCustomItem => ({
  key,
  node,
  type: 'custom',
});

/**
 * Builds the final toolbar sections from an item registry and an optional preset.
 *
 * @param args Toolbar item registry and preset.
 * @returns Final toolbar sections.
 */
export const createMarkdownToolbarSections = ({
  itemRegistry,
  preset,
}: CreateMarkdownToolbarSectionsArgs): ToolbarSection[] =>
  resolveMarkdownToolbarPresetSections({
    itemRegistry,
    preset,
  });
