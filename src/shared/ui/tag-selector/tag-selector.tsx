'use client';

import React, { useCallback, useId, useState } from 'react';
import { css, cva, cx } from 'styled-system/css';

import { ArrowUpIcon } from '@/shared/ui/icons/app-icons';

type TagItem = {
  group?: string;
  id: string;
  label: string;
  slug: string;
};

type TagSelectorProps = {
  availableTags: TagItem[];
  className?: string;
  emptyText?: string;
  onChange: (slugs: string[]) => void;
  onExpandedChange?: (isExpanded: boolean) => void;
  poolLabel?: string;
  poolTitle?: string;
  selectLabel?: string;
  selectedTagSlugs: string[];
};

/**
 * Checks whether a tag slug is currently selected.
 */
const hasSelectedTag = (selectedTagSlugs: string[], tagSlug: string) =>
  selectedTagSlugs.includes(tagSlug);

/**
 * Shared tag selection UI used across the editor.
 */
const TagSelectorBase = ({
  availableTags,
  className,
  emptyText = 'No tags are available.',
  onChange,
  onExpandedChange,
  poolLabel = 'Tag selector',
  poolTitle = 'Tags',
  selectLabel = 'Tag',
  selectedTagSlugs,
}: TagSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const poolId = useId();

  /**
   * Toggles a tag selection and emits the updated slug list.
   */
  const handleTagToggle = useCallback(
    (tagSlug: string) => {
      if (hasSelectedTag(selectedTagSlugs, tagSlug)) {
        onChange(selectedTagSlugs.filter(slug => slug !== tagSlug));
        return;
      }

      onChange([...selectedTagSlugs, tagSlug]);
    },
    [onChange, selectedTagSlugs],
  );

  /**
   * Reads the slug from the button dataset and forwards it to the toggle handler.
   */
  const handleTagClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const tagSlug = event.currentTarget.dataset.tagSlug;

      if (!tagSlug) {
        return;
      }

      handleTagToggle(tagSlug);
    },
    [handleTagToggle],
  );

  const handleExpandedToggle = useCallback(() => {
    const nextExpanded = !isExpanded;

    setIsExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  }, [isExpanded, onExpandedChange]);

  return (
    <section aria-label={poolLabel} className={cx(rootClass, className)}>
      <div className={poolHeaderClass}>
        <h2 className={poolTitleClass}>{poolTitle}</h2>
        <button
          aria-controls={`${poolId}-panel`}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded
              ? `Collapse ${selectLabel.toLowerCase()} list`
              : `Expand ${selectLabel.toLowerCase()} list`
          }
          className={toggleButtonClass}
          onClick={handleExpandedToggle}
          type="button"
        >
          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
          <ArrowUpIcon
            aria-hidden
            className={cx(toggleIconClass, !isExpanded ? toggleIconCollapsedClass : undefined)}
            color="muted"
            size="sm"
          />
        </button>
      </div>

      {isExpanded ? (
        <div className={poolClass} id={`${poolId}-panel`}>
          {availableTags.length > 0 ? (
            availableTags.map((tag, index) => {
              const isSelected = hasSelectedTag(selectedTagSlugs, tag.slug);
              const previousTagGroup = index > 0 ? availableTags[index - 1]?.group : undefined;
              const shouldRenderGroupGap =
                index > 0 &&
                typeof tag.group === 'string' &&
                typeof previousTagGroup === 'string' &&
                previousTagGroup !== tag.group;

              return (
                <React.Fragment key={tag.id}>
                  {shouldRenderGroupGap ? (
                    <span
                      aria-hidden
                      className={groupSeparatorClass}
                      data-group-separator={tag.group}
                    />
                  ) : null}
                  <button
                    aria-label={`${tag.label} ${
                      isSelected
                        ? `Deselect ${selectLabel.toLowerCase()}`
                        : `Select ${selectLabel.toLowerCase()}`
                    }`}
                    aria-pressed={isSelected}
                    className={chipRecipe({ selected: isSelected })}
                    data-tag-slug={tag.slug}
                    onClick={handleTagClick}
                    type="button"
                  >
                    <span className={chipLabelClass}>{tag.label}</span>
                  </button>
                </React.Fragment>
              );
            })
          ) : (
            <p className={helperTextClass}>{emptyText}</p>
          )}
        </div>
      ) : null}
    </section>
  );
};

TagSelectorBase.displayName = 'TagSelector';

export const TagSelector = React.memo(TagSelectorBase);

const rootClass = css({
  display: 'grid',
  gap: '4',
});

const helperTextClass = css({
  fontSize: 'sm',
  color: 'muted',
});

const poolHeaderClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '3',
});

const poolTitleClass = css({
  fontSize: 'sm',
  fontWeight: 'semibold',
  color: 'text',
});

const toggleButtonClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1.5',
  fontSize: 'sm',
  color: 'muted',
  _focusVisible: {
    outline: '[2px solid var(--colors-focus-ring)]',
    outlineOffset: '[2px]',
  },
});

const toggleIconClass = css({
  transition: 'transform',
});

const toggleIconCollapsedClass = css({
  transform: 'rotate(180deg)',
});

const poolClass = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2',
});

const groupSeparatorClass = css({
  flexBasis: 'full',
  height: '2',
});

const chipRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '[2.25rem]',
    px: '3',
    borderRadius: 'full',
    borderWidth: '1px',
    borderStyle: 'solid',
    fontSize: 'sm',
    transition: 'common',
    _focusVisible: {
      outline: '[2px solid var(--colors-focus-ring)]',
      outlineOffset: '[2px]',
    },
  },
  variants: {
    selected: {
      false: {
        borderColor: 'border',
        background: 'surface',
        color: 'muted',
        _hover: {
          borderColor: 'borderStrong',
          color: 'text',
        },
      },
      true: {
        borderColor: 'transparent',
        background: 'primary',
        color: 'primaryContrast',
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});

const chipLabelClass = css({
  lineHeight: 'tight',
});
