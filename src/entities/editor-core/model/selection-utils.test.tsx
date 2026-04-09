import { describe, expect, it, vi } from 'vitest';

import { applyTextareaTransform, getPendingSelection, wrapSelection } from '@/entities/editor-core';

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
      textarea.value = typeof value === 'string' ? value : '';
      return true;
    });
    const restoreExecCommand = installExecCommand(execCommand);

    applyTextareaTransform(textarea, onChange, target => wrapSelection(target, '**', '**', 'Text'));

    await Promise.resolve();

    expect(execCommand).toHaveBeenCalledWith('insertText', false, '**Hello** world');
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
