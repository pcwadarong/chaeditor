import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { mediaQueryDown } from '@/shared/config/breakpoints';
import { Button } from '@/shared/ui/button';
import { MarkdownEditor } from '@/widgets/editor';

import '@testing-library/jest-dom/vitest';

type MatchMediaController = {
  setMatches: (matches: boolean) => void;
};

/**
 * Installs a controllable matchMedia mock for the editor layout tests.
 */
const installMatchMediaMock = (initialMatches: boolean): MatchMediaController => {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation(() => ({
      addEventListener: (_eventName: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
      get matches() {
        return matches;
      },
      media: mediaQueryDown.md,
      removeEventListener: (_eventName: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
    })),
  );

  return {
    setMatches: nextMatches => {
      matches = nextMatches;
      listeners.forEach(listener =>
        listener({
          matches: nextMatches,
          media: mediaQueryDown.md,
        } as MediaQueryListEvent),
      );
    },
  };
};

/**
 * Renders the editor with a controlled value state for interaction tests.
 */
const renderHarness = (initialValue = '') => {
  const adapters = {
    uploadFile: vi.fn(async () => ({
      contentType: 'application/pdf',
      fileName: 'resume.pdf',
      fileSize: 2048,
      url: 'https://example.com/resume.pdf',
    })),
  };

  const Harness = () => {
    const [value, setValue] = React.useState(initialValue);

    return (
      <MarkdownEditor adapters={adapters} contentType="article" onChange={setValue} value={value} />
    );
  };

  return {
    adapters,
    ...render(<Harness />),
  };
};

describe('MarkdownEditor', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Under markdown content updates, MarkdownEditor must render the preview from the current textarea value', async () => {
    installMatchMediaMock(false);
    renderHarness();

    fireEvent.change(screen.getByRole('textbox', { name: 'Markdown editor input' }), {
      target: { value: '# Hello world' },
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Hello world' })).toBeInTheDocument();
    });
  });

  it('Under desktop rendering, MarkdownEditor must keep both panes mounted as independent scroll surfaces', async () => {
    installMatchMediaMock(false);
    const { container } = renderHarness('# Preview title');

    await screen.findByRole('heading', { level: 1, name: 'Preview title' });

    const body = container.querySelector('[data-slot="body"]');
    const editorPane = container.querySelector('[data-slot="editor-pane"]');
    const previewPane = container.querySelector('[data-slot="preview-pane"]');

    expect(body).toBeTruthy();
    expect(editorPane).toBeTruthy();
    expect(previewPane).toBeTruthy();
    expect(editorPane?.hasAttribute('hidden')).toBe(false);
    expect(previewPane?.hasAttribute('hidden')).toBe(false);
  });

  it('Under a mobile viewport, MarkdownEditor must switch between the Edit and Preview panes', async () => {
    installMatchMediaMock(true);
    renderHarness('# Preview title');

    expect(screen.getByRole('textbox', { name: 'Markdown editor input' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Preview' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Preview' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Preview title' })).toBeVisible();
    });
  });

  it('Under a pasted URL over selected text, MarkdownEditor must convert the selection into markdown link syntax', async () => {
    installMatchMediaMock(false);
    renderHarness('OpenAI');

    const textarea = screen.getByRole('textbox', {
      name: 'Markdown editor input',
    }) as HTMLTextAreaElement;
    textarea.focus();
    textarea.setSelectionRange(0, textarea.value.length);

    fireEvent.paste(textarea, {
      clipboardData: {
        getData: () => 'https://openai.com',
      },
    });

    await waitFor(() => {
      expect(textarea.value).toBe('[OpenAI](https://openai.com/)');
    });
  });

  it('Under an empty value and a custom preview message, MarkdownEditor must render the provided empty preview text', async () => {
    installMatchMediaMock(true);

    render(
      <MarkdownEditor
        contentType="article"
        onChange={() => {}}
        previewEmptyText="Preview is empty."
        value=""
      />,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Preview' }));

    await waitFor(() => {
      expect(screen.getByText('Preview is empty.')).toBeVisible();
    });
  });

  it('Under a host toolbar UI registry, MarkdownEditor must pass the custom toolbar labels to nested triggers', () => {
    installMatchMediaMock(false);

    render(
      <MarkdownEditor
        contentType="article"
        onChange={() => {}}
        uiRegistry={{
          labels: {
            linkEmbedPopover: {
              triggerAriaLabel: 'Add product link',
              triggerTooltip: 'Add product link',
            },
          },
        }}
        value=""
      />,
    );

    expect(screen.getByRole('button', { name: 'Add product link' })).toBeInTheDocument();
  });

  it('Under a custom primitive registry, MarkdownEditor must pass the override to nested toolbar actions', () => {
    installMatchMediaMock(false);

    const HostButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
      (props, ref) => <Button {...props} data-primitive="custom-button" ref={ref} />,
    );
    HostButton.displayName = 'HostButton';

    render(
      <MarkdownEditor
        contentType="article"
        onChange={() => {}}
        primitiveRegistry={{ Button: HostButton }}
        value=""
      />,
    );

    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'data-primitive',
      'custom-button',
    );
  });
});
