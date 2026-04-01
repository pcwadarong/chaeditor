import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { EditorLocalePanel } from '@/widgets/editor/ui/core/editor-locale-panel';

vi.mock('@/features/edit-markdown/ui/markdown-toolbar', () => ({
  MarkdownToolbar: () => <div data-testid="markdown-toolbar" />,
}));

vi.mock('@/shared/lib/markdown/rich-markdown', () => ({
  renderRichMarkdown: ({ markdown }: { markdown: string }) => <div>{markdown}</div>,
}));

const baseProps = {
  activeLocaleHasTitleError: false,
  contentType: 'article' as const,
  isActive: true,
  isMobileLayout: false,
  locale: 'ko' as const,
  markdownOptions: {} as never,
  mobileEditorPane: 'edit' as const,
  onContentChange: vi.fn(),
  onDescriptionChange: vi.fn(),
  onTextareaKeyDown: vi.fn(),
  onTextareaPaste: vi.fn(),
  onTextareaScroll: vi.fn(),
  onTitleChange: vi.fn(),
  textareaRef: { current: null },
  translation: {
    content: '',
    description: '',
    title: '',
  },
};

describe('EditorLocalePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('Under a title error, EditorLocalePanel must connect the textarea and error message', () => {
    render(<EditorLocalePanel {...baseProps} activeLocaleHasTitleError />);
    const titleField = screen.getByLabelText('Title');

    expect(screen.getByRole('alert').textContent).toBe('Please enter a title.');
    expect(titleField.getAttribute('aria-invalid')).toBe('true');
    expect(titleField.getAttribute('aria-describedby')).toBe('editor-title-error-ko');
  });

  it('Under content input updates, EditorLocalePanel must pass the locale with the next value', () => {
    render(<EditorLocalePanel {...baseProps} />);

    fireEvent.change(screen.getByLabelText('Content input'), {
      target: { value: 'New content' },
    });

    expect(baseProps.onContentChange).toHaveBeenCalledWith('ko', 'New content');
  });

  it('Under content input updates, EditorLocalePanel must not recreate the pane measurement observer', () => {
    const resizeObserver = {
      disconnect: vi.fn(),
      observe: vi.fn(),
    };
    const resizeObserverConstructor = vi.fn().mockImplementation(() => resizeObserver);
    const boundingRect = {
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      toJSON: () => ({}),
      top: 120,
      width: 0,
      x: 0,
      y: 0,
    } satisfies DOMRect;

    vi.stubGlobal('ResizeObserver', resizeObserverConstructor);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      boundingRect as DOMRect,
    );

    const { rerender } = render(<EditorLocalePanel {...baseProps} />);

    expect(resizeObserverConstructor).toHaveBeenCalledTimes(1);

    rerender(
      <EditorLocalePanel
        {...baseProps}
        translation={{
          ...baseProps.translation,
          title: 'Updated title',
        }}
      />,
    );

    expect(resizeObserverConstructor).toHaveBeenCalledTimes(1);
  });

  it('Under a changed layoutShiftToken, EditorLocalePanel must recalculate the editor pane height', () => {
    let top = 220;

    vi.stubGlobal(
      'ResizeObserver',
      vi.fn().mockImplementation(() => ({
        disconnect: vi.fn(),
        observe: vi.fn(),
      })),
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () =>
        ({
          bottom: top + 120,
          height: 120,
          left: 0,
          right: 600,
          toJSON: () => ({}),
          top,
          width: 600,
          x: 0,
          y: top,
        }) as DOMRect,
    );

    const { rerender } = render(<EditorLocalePanel {...baseProps} layoutShiftToken={0} />);
    const editRegion = screen.getByRole('region', { name: 'Content Edit' });
    const editorGrid = editRegion.parentElement as HTMLDivElement;

    expect(editorGrid.style.height).toBe(`${window.innerHeight - top - 24}px`);

    top = 140;

    rerender(<EditorLocalePanel {...baseProps} layoutShiftToken={1} />);

    expect(editorGrid.style.height).toBe(`${window.innerHeight - top - 24}px`);
  });
});
