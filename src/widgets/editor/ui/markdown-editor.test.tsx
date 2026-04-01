import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { mediaQueryDown } from '@/shared/config/breakpoints';
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
});
