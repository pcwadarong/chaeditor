const pendingSelectionStartKey = 'selectionUtilsPendingStart';
const pendingSelectionEndKey = 'selectionUtilsPendingEnd';

type TextareaValueChangeHandler = (value: string) => void;
type TextareaValueTransform = (textarea: HTMLTextAreaElement) => string;

/**
 * Stores the selection range on the textarea dataset for restoration after render.
 */
const setPendingSelection = (textarea: HTMLTextAreaElement, start: number, end: number) => {
  textarea.dataset[pendingSelectionStartKey] = String(start);
  textarea.dataset[pendingSelectionEndKey] = String(end);
};

/**
 * Resolves the selected line block used for prefix toggling.
 */
const getSelectedLineRange = (textarea: HTMLTextAreaElement) => {
  const { selectionEnd, selectionStart, value } = textarea;
  const lineStart = selectionStart === 0 ? 0 : value.lastIndexOf('\n', selectionStart - 1) + 1;
  const nextLineBreakIndex = value.indexOf('\n', selectionEnd);
  const lineEnd = nextLineBreakIndex === -1 ? value.length : nextLineBreakIndex;

  return {
    lineEnd,
    lineStart,
    text: value.slice(lineStart, lineEnd),
  };
};

/**
 * Shared pattern for checking whether all selected lines use the same heading level.
 */
const headingPrefixPattern = /^(#{1,6})\s+/;
const unorderedListPattern = /^(\s*)([-*])\s+(.*)$/;
const unorderedListMarkerOnlyPattern = /^(\s*)([-*])\s*$/;
const orderedListPattern = /^(\s*)(\d+)\.\s+(.*)$/;
const orderedListMarkerOnlyPattern = /^(\s*)(\d+)\.\s*$/;
const listItemPattern = /^(\s*)((?:[-*])|(?:\d+\.))\s+/;

/**
 * Replaces the selected line block and stores the next selection range.
 */
const replaceSelectedLineRange = (
  textarea: HTMLTextAreaElement,
  nextBlock: string,
  lineStart: number,
  lineEnd: number,
) => {
  const nextValue = [
    textarea.value.slice(0, lineStart),
    nextBlock,
    textarea.value.slice(lineEnd),
  ].join('');

  setPendingSelection(textarea, lineStart, lineStart + nextBlock.length);

  return nextValue;
};

/**
 * Wraps the current selection with prefix and suffix strings.
 * Inserts the placeholder and selects it when there is no selection.
 */
export const wrapSelection = (
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder = 'Text',
) => {
  const { selectionEnd, selectionStart, value } = textarea;
  const selectedText = value.slice(selectionStart, selectionEnd);
  const nextSelectionText = selectedText || placeholder;
  const nextValue = [
    value.slice(0, selectionStart),
    before,
    nextSelectionText,
    after,
    value.slice(selectionEnd),
  ].join('');
  const nextStart = selectionStart + before.length;
  const nextEnd = nextStart + nextSelectionText.length;

  setPendingSelection(textarea, nextStart, nextEnd);

  return nextValue;
};

/**
 * Toggles a line prefix for each selected line.
 * Empty lines are left unchanged.
 */
export const prefixLine = (textarea: HTMLTextAreaElement, prefix: string) => {
  const { lineEnd, lineStart, text } = getSelectedLineRange(textarea);
  const lines = text.split('\n');
  const nonEmptyLines = lines.filter(line => line.length > 0);
  const shouldRemovePrefix =
    nonEmptyLines.length > 0 && nonEmptyLines.every(line => line.startsWith(prefix));
  const nextLines = lines.map(line => {
    if (line.length === 0) return line;

    if (shouldRemovePrefix) {
      return line.startsWith(prefix) ? line.slice(prefix.length) : line;
    }

    return line.startsWith(prefix) ? line : `${prefix}${line}`;
  });
  const nextBlock = nextLines.join('\n');
  const nextValue = [
    textarea.value.slice(0, lineStart),
    nextBlock,
    textarea.value.slice(lineEnd),
  ].join('');

  setPendingSelection(textarea, lineStart, lineStart + nextBlock.length);

  return nextValue;
};

/**
 * Replaces the current selection with a template and restores the caret.
 */
export const insertTemplate = (
  textarea: HTMLTextAreaElement,
  template: string,
  cursorOffset = template.length,
) => {
  const { selectionEnd, selectionStart, value } = textarea;
  const nextValue = [value.slice(0, selectionStart), template, value.slice(selectionEnd)].join('');
  const nextCursor = selectionStart + cursorOffset;

  setPendingSelection(textarea, nextCursor, nextCursor);

  return nextValue;
};

/**
 * Restores the selection range on the rendered textarea after state updates.
 */
export const restoreCursor = (textarea: HTMLTextAreaElement, start: number, end: number) => {
  const maxIndex = textarea.value.length;
  const nextStart = Math.max(0, Math.min(start, maxIndex));
  const nextEnd = Math.max(nextStart, Math.min(end, maxIndex));

  textarea.setSelectionRange(nextStart, nextEnd);
  delete textarea.dataset[pendingSelectionStartKey];
  delete textarea.dataset[pendingSelectionEndKey];
};

/**
 * Returns focus to the textarea after a toolbar interaction.
 */
export const focusTextarea = (textarea: HTMLTextAreaElement) => {
  textarea.focus({ preventScroll: true });
};

/**
 * Reads the pending selection range stored for the next render cycle.
 */
export const getPendingSelection = (textarea: HTMLTextAreaElement) => {
  const start = Number(textarea.dataset[pendingSelectionStartKey]);
  const end = Number(textarea.dataset[pendingSelectionEndKey]);

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return {
      end: textarea.selectionEnd,
      start: textarea.selectionStart,
    };
  }

  return { end, start };
};

/**
 * Runs a textarea transform and restores focus and selection after `onChange`.
 */
export const applyTextareaTransform = (
  textarea: HTMLTextAreaElement,
  onChange: TextareaValueChangeHandler,
  transform: TextareaValueTransform,
) => {
  const nextValue = transform(textarea);

  onChange(nextValue);

  queueMicrotask(() => {
    const pendingSelection = getPendingSelection(textarea);
    focusTextarea(textarea);
    restoreCursor(textarea, pendingSelection.start, pendingSelection.end);
  });

  return nextValue;
};

/**
 * Toggles the selected lines to the requested heading level.
 */
export const toggleHeadingLine = (textarea: HTMLTextAreaElement, level: 1 | 2 | 3 | 4) => {
  const { lineEnd, lineStart, text } = getSelectedLineRange(textarea);
  const lines = text.split('\n');
  const targetPrefix = `${'#'.repeat(level)} `;
  if (lines.length === 1 && lines[0].trim().length === 0) {
    const nextValue = [
      textarea.value.slice(0, lineStart),
      targetPrefix,
      textarea.value.slice(lineEnd),
    ].join('');

    setPendingSelection(textarea, lineStart + targetPrefix.length, lineStart + targetPrefix.length);

    return nextValue;
  }

  const nonEmptyLines = lines.filter(line => line.trim().length > 0);
  const shouldRemoveTargetPrefix =
    nonEmptyLines.length > 0 && nonEmptyLines.every(line => line.startsWith(targetPrefix));
  const nextLines = lines.map(line => {
    if (line.trim().length === 0) return line;

    if (shouldRemoveTargetPrefix) {
      return line.startsWith(targetPrefix) ? line.slice(targetPrefix.length) : line;
    }

    const withoutHeadingPrefix = line.replace(headingPrefixPattern, '');

    return `${targetPrefix}${withoutHeadingPrefix}`;
  });
  const nextBlock = nextLines.join('\n');
  const nextValue = [
    textarea.value.slice(0, lineStart),
    nextBlock,
    textarea.value.slice(lineEnd),
  ].join('');

  setPendingSelection(textarea, lineStart, lineStart + nextBlock.length);

  return nextValue;
};

/**
 * Continues or exits a markdown list item when Enter is pressed.
 */
export const continueMarkdownList = (textarea: HTMLTextAreaElement) => {
  const { selectionEnd, selectionStart, value } = textarea;
  if (selectionStart !== selectionEnd) return null;

  const { lineEnd, lineStart, text } = getSelectedLineRange(textarea);
  const beforeCursor = value.slice(lineStart, selectionStart);
  const unorderedMatch = beforeCursor.match(unorderedListPattern);
  const orderedMatch = beforeCursor.match(orderedListPattern);
  const unorderedMarkerOnlyMatch = text.match(unorderedListMarkerOnlyPattern);
  const orderedMarkerOnlyMatch = text.match(orderedListMarkerOnlyPattern);

  if (unorderedMarkerOnlyMatch || orderedMarkerOnlyMatch) {
    const nextValue = [value.slice(0, lineStart), value.slice(lineEnd)].join('');

    setPendingSelection(textarea, lineStart, lineStart);

    return nextValue;
  }

  if (unorderedMatch) {
    const [, indent, marker] = unorderedMatch;
    const insertion = `\n${indent}${marker} `;
    const nextValue = [value.slice(0, selectionStart), insertion, value.slice(selectionEnd)].join(
      '',
    );
    const nextCursor = selectionStart + insertion.length;

    setPendingSelection(textarea, nextCursor, nextCursor);

    return nextValue;
  }

  if (orderedMatch) {
    const [, indent, rawNumber] = orderedMatch;
    const insertion = `\n${indent}${Number(rawNumber) + 1}. `;
    const nextValue = [value.slice(0, selectionStart), insertion, value.slice(selectionEnd)].join(
      '',
    );
    const nextCursor = selectionStart + insertion.length;

    setPendingSelection(textarea, nextCursor, nextCursor);

    return nextValue;
  }

  return null;
};

/**
 * Indents the selected list lines by one nesting level.
 */
export const indentMarkdownList = (textarea: HTMLTextAreaElement) => {
  const { lineEnd, lineStart, text } = getSelectedLineRange(textarea);
  const lines = text.split('\n');
  if (!lines.some(line => listItemPattern.test(line))) return null;

  const nextBlock = lines.map(line => (listItemPattern.test(line) ? `  ${line}` : line)).join('\n');

  return replaceSelectedLineRange(textarea, nextBlock, lineStart, lineEnd);
};

/**
 * Outdents the selected list lines by one nesting level.
 */
export const outdentMarkdownList = (textarea: HTMLTextAreaElement) => {
  const { lineEnd, lineStart, text } = getSelectedLineRange(textarea);
  const lines = text.split('\n');
  if (!lines.some(line => /^\s+/.test(line) && listItemPattern.test(line.trimStart()))) return null;

  const nextBlock = lines
    .map(line => {
      if (!listItemPattern.test(line.trimStart())) return line;

      return line.startsWith('  ') ? line.slice(2) : line.startsWith(' ') ? line.slice(1) : line;
    })
    .join('\n');

  return replaceSelectedLineRange(textarea, nextBlock, lineStart, lineEnd);
};
