import type {
  MarkdownToolbarPresetItemKey,
  MarkdownToolbarUiLabels,
  ToolbarActionItem,
  ToolbarCustomItem,
  ToolbarSectionItem,
  ToolbarTokenOption,
} from '@/features/edit-markdown/toolbar/contracts/markdown-toolbar.types';
import {
  createToolbarActionItems,
  createToolbarCustomItem,
} from '@/features/edit-markdown/toolbar/contracts/markdown-toolbar-composition';
import type { ResolvedMarkdownToolbarUiRegistry } from '@/features/edit-markdown/toolbar/shell/markdown-toolbar-ui-registry';

type CreateMarkdownToolbarItemRegistryArgs = {
  adapters?: {
    uploadFile?: unknown;
  };
  embedItems: ToolbarCustomItem[];
  headingPopoverOptions: ToolbarTokenOption[];
  highlightItems: ToolbarCustomItem[];
  inlineFormatActions: ToolbarActionItem[];
  popoverTriggerClassName: string;
  textStructureActions: ToolbarActionItem[];
  togglePopoverOptions: ToolbarTokenOption[];
  toolbarLabels?: MarkdownToolbarUiLabels;
  toolbarUiRegistry: ResolvedMarkdownToolbarUiRegistry;
  blockSyntaxActions: ToolbarActionItem[];
};

/**
 * Builds the toolbar item registry consumed by the preset composition helpers.
 */
export const createMarkdownToolbarItemRegistry = ({
  adapters,
  blockSyntaxActions,
  embedItems,
  headingPopoverOptions,
  highlightItems,
  inlineFormatActions,
  popoverTriggerClassName,
  textStructureActions,
  togglePopoverOptions,
  toolbarLabels,
  toolbarUiRegistry,
}: CreateMarkdownToolbarItemRegistryArgs): Partial<
  Record<MarkdownToolbarPresetItemKey, ToolbarSectionItem>
> =>
  Object.fromEntries(
    [
      createToolbarCustomItem(
        'heading-popover',
        toolbarUiRegistry.renderHeadingPopover({
          labels: {
            panelLabel: toolbarLabels?.headingPopover?.panelLabel ?? 'Choose heading level',
            triggerAriaLabel: toolbarLabels?.headingPopover?.triggerAriaLabel ?? 'Heading',
            triggerTooltip: toolbarLabels?.headingPopover?.triggerTooltip ?? 'Heading',
          },
          onTriggerMouseDown: event => event.preventDefault(),
          options: headingPopoverOptions,
          triggerClassName: popoverTriggerClassName,
          triggerToken: 'H',
        }),
      ),
      ...createToolbarActionItems(textStructureActions),
      ...createToolbarActionItems(inlineFormatActions),
      ...highlightItems,
      ...createToolbarActionItems(blockSyntaxActions),
      createToolbarCustomItem(
        'toggle-popover',
        toolbarUiRegistry.renderTogglePopover({
          labels: {
            panelLabel: toolbarLabels?.togglePopover?.panelLabel ?? 'Choose toggle level',
            triggerAriaLabel: toolbarLabels?.togglePopover?.triggerAriaLabel ?? 'Toggle',
            triggerTooltip: toolbarLabels?.togglePopover?.triggerTooltip ?? 'Toggle',
          },
          onTriggerMouseDown: event => event.preventDefault(),
          options: togglePopoverOptions,
          triggerClassName: popoverTriggerClassName,
          triggerToken: 'T',
        }),
      ),
      ...embedItems.filter(item => item.key !== 'file-embed' || Boolean(adapters?.uploadFile)),
    ].map(item => [item.key as MarkdownToolbarPresetItemKey, item] as const),
  ) as Partial<Record<MarkdownToolbarPresetItemKey, ToolbarSectionItem>>;
