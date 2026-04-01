export type MarkdownToolbarSectionKey =
  | 'heading-and-subtext'
  | 'text-emphasis'
  | 'highlight-and-alignment'
  | 'block-syntax'
  | 'embed-and-media';

export type MarkdownToolbarPresetItemKey =
  | 'heading-popover'
  | 'subtext'
  | 'bold'
  | 'italic'
  | 'strike'
  | 'underline'
  | 'text-color'
  | 'background-color'
  | 'align'
  | 'horizontal-rule'
  | 'quote'
  | 'code-block'
  | 'table'
  | 'spoiler'
  | 'toggle-popover'
  | 'math-embed'
  | 'file-embed'
  | 'image-embed'
  | 'link-embed'
  | 'video-embed';

export type MarkdownToolbarPresetSection = {
  itemKeys: MarkdownToolbarPresetItemKey[];
  key: MarkdownToolbarSectionKey;
};

export type MarkdownToolbarResolvedSection<TItem> = {
  items: TItem[];
  key: MarkdownToolbarSectionKey;
};

/**
 * Default toolbar preset expressed as pure section and item keys.
 */
export const DEFAULT_MARKDOWN_TOOLBAR_PRESET: MarkdownToolbarPresetSection[] = [
  {
    itemKeys: ['heading-popover', 'subtext'],
    key: 'heading-and-subtext',
  },
  {
    itemKeys: ['bold', 'italic', 'strike', 'underline'],
    key: 'text-emphasis',
  },
  {
    itemKeys: ['text-color', 'background-color', 'align'],
    key: 'highlight-and-alignment',
  },
  {
    itemKeys: ['horizontal-rule', 'quote', 'code-block', 'table', 'spoiler', 'toggle-popover'],
    key: 'block-syntax',
  },
  {
    itemKeys: ['math-embed', 'file-embed', 'image-embed', 'link-embed', 'video-embed'],
    key: 'embed-and-media',
  },
];

/**
 * Resolves the final toolbar sections from a preset and an item registry.
 *
 * @param itemRegistry Map from toolbar item keys to concrete section items.
 * @param preset Optional toolbar preset.
 * @returns Resolved toolbar sections.
 */
export const resolveMarkdownToolbarPresetSections = <TItem>({
  itemRegistry,
  preset = DEFAULT_MARKDOWN_TOOLBAR_PRESET,
}: {
  itemRegistry: Partial<Record<MarkdownToolbarPresetItemKey, TItem>>;
  preset?: MarkdownToolbarPresetSection[];
}): MarkdownToolbarResolvedSection<TItem>[] =>
  preset.map(section => ({
    items: section.itemKeys
      .map(itemKey => itemRegistry[itemKey])
      .filter((item): item is TItem => item !== undefined),
    key: section.key,
  }));
