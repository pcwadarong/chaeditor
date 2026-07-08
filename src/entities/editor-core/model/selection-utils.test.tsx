import { describe, expect, it, vi } from 'vitest';

import {
  applyTextareaTransform,
  continueMarkdownList,
  getPendingSelection,
  toggleHeadingLine,
  wrapSelection,
} from '@/entities/editor-core';

/**
 * Creates a detached textarea with a value and selection range for line tests.
 */
const createTextarea = (value: string, selectionStart: number, selectionEnd = selectionStart) => {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.selectionStart = selectionStart;
  textarea.selectionEnd = selectionEnd;
  return textarea;
};

const installExecCommand = (implementation: typeof document.execCommand) => {
  const originalExecCommand = document.execCommand;

  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: implementation,
    writable: true,
  });

  return () => {
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: originalExecCommand,
      writable: true,
    });
  };
};

describe('applyTextareaTransform', () => {
  it('when execCommand succeeds, it must not call onChange directly and must restore textarea scroll', async () => {
    const textarea = document.createElement('textarea');
    textarea.value = 'Hello world';
    textarea.selectionStart = 0;
    textarea.selectionEnd = 5;
    textarea.scrollTop = 120;
    textarea.scrollLeft = 18;

    const onChange = vi.fn();
    const execCommand = vi.fn((_command: string, _showUi: boolean, value?: string) => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.slice(0, start) + (value ?? '') + textarea.value.slice(end);
      return true;
    });
    const restoreExecCommand = installExecCommand(execCommand);

    applyTextareaTransform(textarea, onChange, target => wrapSelection(target, '**', '**', 'Text'));

    await Promise.resolve();
    expect(execCommand).toHaveBeenCalledWith('insertText', false, '**Hello**');
    expect(onChange).not.toHaveBeenCalled();
    expect(textarea.scrollTop).toBe(120);
    expect(textarea.scrollLeft).toBe(18);

    const pendingSelection = getPendingSelection(textarea);

    expect(pendingSelection.start).toBe(2);
    expect(pendingSelection.end).toBe(7);

    restoreExecCommand();
  });

  it('when execCommand fails, it must fall back to onChange with the transformed value', async () => {
    const textarea = document.createElement('textarea');
    textarea.value = 'Hello world';
    textarea.selectionStart = 0;
    textarea.selectionEnd = 5;

    const onChange = vi.fn();
    const execCommand = vi.fn(() => false);
    const restoreExecCommand = installExecCommand(execCommand);

    const nextValue = applyTextareaTransform(textarea, onChange, target =>
      wrapSelection(target, '**', '**', 'Text'),
    );

    await Promise.resolve();

    expect(nextValue).toBe('**Hello** world');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('**Hello** world');

    restoreExecCommand();
  });
});

describe('toggleHeadingLine', () => {
  it('when the selection ends on a trailing line break, it must not affect the following line', () => {
    // Selection covers "line1\n" (start 0, end 6 — index 5 is the newline).
    const textarea = createTextarea('line1\nline2', 0, 6);

    expect(toggleHeadingLine(textarea, 1)).toBe('# line1\nline2');
  });
});

describe('continueMarkdownList', () => {
  it('continues a GFM task list item with a fresh unchecked box', () => {
    const value = '- [ ] task';
    const textarea = createTextarea(value, value.length);

    expect(continueMarkdownList(textarea)).toBe('- [ ] task\n- [ ] ');
  });

  it('exits the task list when the current item is empty', () => {
    const value = '- [ ] ';
    const textarea = createTextarea(value, value.length);

    expect(continueMarkdownList(textarea)).toBe('');
  });
});
