const pendingSelectionStartKey = 'selectionUtilsPendingStart';
const pendingSelectionEndKey = 'selectionUtilsPendingEnd';

type TextareaValueChangeHandler = (value: string) => void;
type TextareaValueTransform = (textarea: HTMLTextAreaElement) => string;
type TextareaScrollPosition = {
  left: number;
  top: number;
};

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
 * Reads the current textarea scroll position before a programmatic transform.
 */
const getTextareaScrollPosition = (textarea: HTMLTextAreaElement): TextareaScrollPosition => ({
  left: textarea.scrollLeft,
  top: textarea.scrollTop,
});

/**
 * Restores the textarea scroll position after focus and selection updates.
 */
const restoreTextareaScrollPosition = (
  textarea: HTMLTextAreaElement,
  scrollPosition: TextareaScrollPosition,
) => {
  textarea.scrollLeft = scrollPosition.left;
  textarea.scrollTop = scrollPosition.top;
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
 * Runs a textarea transform and restores focus, scroll position, and selection after `onChange`.
 *
 * Uses `document.execCommand('insertText')` to register the change in the
 * browser's native undo history. When that succeeds, React receives the
 * resulting input event and updates state through the existing textarea
 * `onChange` handler, so this helper must not call `onChange` a second time.
 * Falls back to the direct `onChange` path when `execCommand` is unavailable.
 */
export const applyTextareaTransform = (
  textarea: HTMLTextAreaElement,
  onChange: TextareaValueChangeHandler,
  transform: TextareaValueTransform,
) => {
  const nextValue = transform(textarea);
  const scrollPosition = getTextareaScrollPosition(textarea);
  const canUseExecCommand = typeof document.execCommand === 'function';

  textarea.focus({ preventScroll: true });
  const inserted = canUseExecCommand
    ? (() => {
        const prevValue = textarea.value;
        const minLength = Math.min(prevValue.length, nextValue.length);
        let changeStart = 0;

        while (changeStart < minLength && prevValue[changeStart] === nextValue[changeStart]) {
          changeStart += 1;
        }

        let changeEndPrev = prevValue.length;
        let changeEndNext = nextValue.length;

        while (
          changeEndPrev > changeStart &&
          changeEndNext > changeStart &&
          prevValue[changeEndPrev - 1] === nextValue[changeEndNext - 1]
        ) {
          changeEndPrev -= 1;
          changeEndNext -= 1;
        }

        textarea.setSelectionRange(changeStart, changeEndPrev);
        // execCommand is deprecated, but it is still the most reliable way to push
        return document.execCommand(
          'insertText',
          false,
          nextValue.slice(changeStart, changeEndNext),
        );
      })()
    : false;

  if (!inserted) {
    onChange(nextValue);
  }

  queueMicrotask(() => {
    const pendingSelection = getPendingSelection(textarea);
    focusTextarea(textarea);
    restoreTextareaScrollPosition(textarea, scrollPosition);
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

    return line.replace(headingPrefixPattern, '') === line
      ? `${targetPrefix}${line}`
      : line.replace(headingPrefixPattern, targetPrefix);
  });

  return replaceSelectedLineRange(textarea, nextLines.join('\n'), lineStart, lineEnd);
};

/**
 * Continues or exits the current markdown list item on Enter.
 */
export const continueMarkdownList = (textarea: HTMLTextAreaElement) => {
  const { selectionEnd, selectionStart, value } = textarea;

  if (selectionStart !== selectionEnd) return null;

  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const lineEnd = value.indexOf('\n', selectionStart);
  const resolvedLineEnd = lineEnd === -1 ? value.length : lineEnd;
  const currentLine = value.slice(lineStart, resolvedLineEnd);

  const unorderedMatch = currentLine.match(unorderedListPattern);
  if (unorderedMatch) {
    const [, indent, marker, content] = unorderedMatch;
    const nextLine = content.trim().length === 0 ? '' : `\n${indent}${marker} `;
    const nextValue = `${value.slice(0, selectionStart)}${nextLine}${value.slice(selectionEnd)}`;
    const nextCursor = selectionStart + nextLine.length;

    setPendingSelection(textarea, nextCursor, nextCursor);

    return nextValue;
  }

  const unorderedMarkerOnlyMatch = currentLine.match(unorderedListMarkerOnlyPattern);
  if (unorderedMarkerOnlyMatch) {
    const [, indent] = unorderedMarkerOnlyMatch;
    const replacement = indent;
    const nextValue = [value.slice(0, lineStart), replacement, value.slice(resolvedLineEnd)].join(
      '',
    );
    const nextCursor = lineStart + replacement.length;

    setPendingSelection(textarea, nextCursor, nextCursor);

    return nextValue;
  }

  const orderedMatch = currentLine.match(orderedListPattern);
  if (orderedMatch) {
    const [, indent, numberText, content] = orderedMatch;
    const nextLine = content.trim().length === 0 ? '' : `\n${indent}${Number(numberText) + 1}. `;
    const nextValue = `${value.slice(0, selectionStart)}${nextLine}${value.slice(selectionEnd)}`;
    const nextCursor = selectionStart + nextLine.length;

    setPendingSelection(textarea, nextCursor, nextCursor);

    return nextValue;
  }

  const orderedMarkerOnlyMatch = currentLine.match(orderedListMarkerOnlyPattern);
  if (orderedMarkerOnlyMatch) {
    const [, indent] = orderedMarkerOnlyMatch;
    const replacement = indent;
    const nextValue = [value.slice(0, lineStart), replacement, value.slice(resolvedLineEnd)].join(
      '',
    );
    const nextCursor = lineStart + replacement.length;

    setPendingSelection(textarea, nextCursor, nextCursor);

    return nextValue;
  }

  return null;
};

/**
 * Increases list indentation for the selected markdown list items.
 */
export const indentMarkdownList = (textarea: HTMLTextAreaElement) => {
  const { lineEnd, lineStart, text } = getSelectedLineRange(textarea);
  const lines = text.split('\n');

  if (!lines.some(line => listItemPattern.test(line))) {
    return null;
  }

  const nextLines = lines.map(line => (listItemPattern.test(line) ? `  ${line}` : line));

  return replaceSelectedLineRange(textarea, nextLines.join('\n'), lineStart, lineEnd);
};

/**
 * Decreases list indentation for the selected markdown list items.
 */
export const outdentMarkdownList = (textarea: HTMLTextAreaElement) => {
  const { lineEnd, lineStart, text } = getSelectedLineRange(textarea);
  const lines = text.split('\n');

  if (!lines.some(line => listItemPattern.test(line))) {
    return null;
  }

  const nextLines = lines.map(line => {
    if (!listItemPattern.test(line)) return line;

    if (line.startsWith('  ')) return line.slice(2);
    if (line.startsWith('\t')) return line.slice(1);

    return line;
  });

  return replaceSelectedLineRange(textarea, nextLines.join('\n'), lineStart, lineEnd);
};
