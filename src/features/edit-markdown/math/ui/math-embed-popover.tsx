'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { css } from 'styled-system/css';

import type { MathEmbedApplyPayload } from '@/features/edit-markdown/math/model/math-embed';
import type { ClosePopover } from '@/shared/ui/popover/popover';
import { useMarkdownPrimitives } from '@/shared/ui/primitive-registry/markdown-primitive-registry';

type MathEmbedPopoverProps = {
  onApply: (payload: MathEmbedApplyPayload, closePopover?: ClosePopover) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  triggerClassName?: string;
};

type MathTemplate = {
  formula: string;
  key: string;
  label: string;
  selection: {
    end: number;
    start: number;
  };
};

/**
 * Creates a math template with its initial editable selection range.
 *
 * @param key Template key.
 * @param label Template label.
 * @param prefix Formula prefix.
 * @param editable Default editable part.
 * @param suffix Formula suffix.
 * @returns Template metadata with formula and selection range.
 */
const createMathTemplate = ({
  editable,
  key,
  label,
  prefix,
  suffix,
}: {
  editable: string;
  key: string;
  label: string;
  prefix: string;
  suffix: string;
}): MathTemplate => ({
  formula: `${prefix}${editable}${suffix}`,
  key,
  label,
  selection: {
    end: prefix.length + editable.length,
    start: prefix.length,
  },
});

const mathTemplates = [
  createMathTemplate({
    editable: 'a',
    key: 'fraction',
    label: 'Fraction',
    prefix: '\\frac{',
    suffix: '}{b}',
  }),
  createMathTemplate({
    editable: 'x',
    key: 'sqrt',
    label: 'Root',
    prefix: '\\sqrt{',
    suffix: '}',
  }),
  createMathTemplate({
    editable: 'i=1',
    key: 'sum',
    label: 'Sum',
    prefix: '\\sum_{',
    suffix: '}^{n} i',
  }),
  createMathTemplate({
    editable: 'f(x)',
    key: 'integral',
    label: 'Integral',
    prefix: '\\int_{a}^{b} ',
    suffix: ' \\, dx',
  }),
  createMathTemplate({
    editable: ' x, &x \\ge 0 \\\\ -x, &x < 0',
    key: 'cases',
    label: 'cases',
    prefix: '\\begin{cases}',
    suffix: ' \\end{cases}',
  }),
] satisfies ReadonlyArray<MathTemplate>;

/**
 * Popover for inserting inline or block LaTeX formulas.
 */
export const MathEmbedPopover = ({
  onApply,
  onTriggerMouseDown,
  triggerClassName,
}: MathEmbedPopoverProps) => {
  const { Button, Popover: PrimitivePopover, Textarea } = useMarkdownPrimitives();
  const [mathInput, setMathInput] = useState('');
  const [selectionRange, setSelectionRange] = useState<MathTemplate['selection'] | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    if (!selectionRange || !textareaRef.current) return;

    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(selectionRange.start, selectionRange.end);
    setSelectionRange(null);
  }, [selectionRange]);

  /**
   * Fills the textarea with a predefined math template.
   */
  const handleTemplateSelect = (template: MathTemplate) => {
    setMathInput(template.formula);
    setSelectionRange(template.selection);
  };

  const handleApply = (isBlock: boolean, closePopover?: ClosePopover) => {
    const normalizedInput = mathInput.trim();
    if (!normalizedInput) return;

    onApply(
      {
        formula: normalizedInput,
        isBlock,
      },
      closePopover,
    );
    setMathInput('');
  };

  return (
    <PrimitivePopover
      onTriggerMouseDown={onTriggerMouseDown}
      panelLabel="Insert math"
      portalPlacement="start"
      renderInPortal
      triggerAriaLabel="Math"
      triggerClassName={triggerClassName}
      triggerContent={<span className={triggerTokenClass}>fx</span>}
      triggerTooltip="Math"
    >
      {({ closePopover }) => (
        <div className={popoverContentClass}>
          <div className={templateGridClass}>
            {mathTemplates.map(template => (
              <Button
                key={template.key}
                onClick={() => handleTemplateSelect(template)}
                size="xs"
                tone="white"
                variant="ghost"
              >
                {template.label}
              </Button>
            ))}
          </div>
          <Textarea
            aria-label="LaTeX formula"
            autoResize={false}
            onChange={event => setMathInput(event.target.value)}
            onMouseDown={event => event.stopPropagation()}
            placeholder={'\\frac{a}{b} or \\begin{cases} x, &x \\ge 0 \\\\ -x, &x < 0 \\end{cases}'}
            ref={textareaRef}
            rows={4}
            value={mathInput}
          />
          <div className={actionRowClass}>
            <Button onClick={() => handleApply(false, closePopover)}>Inline</Button>
            <Button onClick={() => handleApply(true, closePopover)}>Block</Button>
          </div>
        </div>
      )}
    </PrimitivePopover>
  );
};

const popoverContentClass = css({
  display: 'grid',
  gap: '3',
  minWidth: '[20rem]',
});

const templateGridClass = css({
  display: 'flex',
  gap: '2',
  flexWrap: 'wrap',
});

const actionRowClass = css({
  display: 'flex',
  gap: '2',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
});

const triggerTokenClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '7',
  fontSize: 'xs',
  fontWeight: 'bold',
  letterSpacing: '[-0.02em]',
});
