import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';

import { viewportMediaQuery } from '@/shared/config/responsive';
import { EditorCore } from '@/widgets/editor';

import '@testing-library/jest-dom/vitest';

type MatchMediaController = {
  setMatches: (matches: boolean) => void;
};

const originalScrollToDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'scrollTo',
);

/**
 * Simple test matchMedia mock that can control the mobile media query.
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
      media: viewportMediaQuery.tabletDown,
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
          media: viewportMediaQuery.tabletDown,
        } as MediaQueryListEvent),
      );
    },
  };
};

/**
 * Gets the Title input from the current locale tab panel.
 */
const getTitleInput = (localeLabel: 'EN' | 'FR' | 'JA' | 'KO') =>
  within(screen.getByRole('tabpanel', { name: localeLabel })).getByRole('textbox', {
    name: 'Title',
  });

const availableTags = [
  { id: 'tag-1', label: 'React', slug: 'react' },
  { id: 'tag-2', label: 'Next.js', slug: 'nextjs' },
];
const EDITOR_CORE_TEST_TIMEOUT_MS = 20_000;

/**
 * Renders EditorCore with the shared test defaults.
 */
const renderEditorCore = (options?: {
  initialTranslations?: React.ComponentProps<typeof EditorCore>['initialTranslations'];
  initialSavedAt?: string | null;
  onDirectPublish?: React.ComponentProps<typeof EditorCore>['onDirectPublish'];
  onDraftSave?: (
    state: Parameters<NonNullable<React.ComponentProps<typeof EditorCore>['onDraftSave']>>[0],
  ) => Promise<void>;
  onOpenPublishPanel?: React.ComponentProps<typeof EditorCore>['onOpenPublishPanel'];
}) => {
  const onDraftSave = options?.onDraftSave ?? vi.fn().mockResolvedValue(undefined);
  const onOpenPublishPanel = options?.onOpenPublishPanel ?? vi.fn();

  render(
    <EditorCore
      availableTags={availableTags}
      contentType="article"
      initialPublished={false}
      initialSavedAt={options?.initialSavedAt ?? null}
      initialSlug=""
      initialTags={[]}
      initialTranslations={
        options?.initialTranslations ?? {
          en: { content: '', description: '', title: '' },
          fr: { content: '', description: '', title: '' },
          ja: { content: '', description: '', title: '' },
          ko: { content: '', description: '', title: '' },
        }
      }
      onDirectPublish={options?.onDirectPublish}
      onDraftSave={onDraftSave}
      onOpenPublishPanel={onOpenPublishPanel}
    />,
  );

  return {
    onDraftSave,
    onOpenPublishPanel,
  };
};

describe('EditorCore', () => {
  beforeEach(() => {
    vi.useRealTimers();
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
      writable: true,
    });
    installMatchMediaMock(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();

    if (originalScrollToDescriptor) {
      Object.defineProperty(HTMLElement.prototype, 'scrollTo', originalScrollToDescriptor);
      return;
    }

    delete (HTMLElement.prototype as Partial<HTMLElement>).scrollTo;
  });

  it(
    'Under locale tab switching, EditorCore must keep Title and Content state isolated per locale',
    async () => {
      renderEditorCore();

      fireEvent.change(getTitleInput('KO'), {
        target: { value: 'Korean Title' },
      });
      fireEvent.change(screen.getByRole('textbox', { name: 'Content input' }), {
        target: { value: 'Korean Content' },
      });

      fireEvent.click(screen.getByRole('tab', { name: 'EN' }));
      fireEvent.change(getTitleInput('EN'), {
        target: { value: 'English title' },
      });
      fireEvent.change(screen.getByRole('textbox', { name: 'Content input' }), {
        target: { value: 'English body' },
      });

      fireEvent.click(screen.getByRole('tab', { name: 'KO' }));

      await waitFor(() => {
        expect(getTitleInput('KO')).toHaveValue('Korean Title');
        expect(screen.getByRole('textbox', { name: 'Content input' })).toHaveValue(
          'Korean Content',
        );
      });

      fireEvent.click(screen.getByRole('tab', { name: 'EN' }));

      await waitFor(() => {
        expect(getTitleInput('EN')).toHaveValue('English title');
        expect(screen.getByRole('textbox', { name: 'Content input' })).toHaveValue('English body');
      });
    },
    EDITOR_CORE_TEST_TIMEOUT_MS,
  );

  it(
    'Under locale switching, EditorCore must preserve textarea scroll positions per locale',
    async () => {
      renderEditorCore();

      const koTextarea = screen.getByRole('textbox', {
        name: 'Content input',
      }) as HTMLTextAreaElement;
      Object.defineProperty(koTextarea, 'scrollTop', {
        configurable: true,
        value: 120,
        writable: true,
      });
      fireEvent.scroll(koTextarea);

      fireEvent.click(screen.getByRole('tab', { name: 'EN' }));

      const enTextarea = screen.getByRole('textbox', {
        name: 'Content input',
      }) as HTMLTextAreaElement;
      Object.defineProperty(enTextarea, 'scrollTop', {
        configurable: true,
        value: 48,
        writable: true,
      });
      fireEvent.scroll(enTextarea);

      fireEvent.click(screen.getByRole('tab', { name: 'KO' }));

      await waitFor(() => {
        expect(
          (screen.getByRole('textbox', { name: 'Content input' }) as HTMLTextAreaElement).scrollTop,
        ).toBe(120);
      });
    },
    EDITOR_CORE_TEST_TIMEOUT_MS,
  );

  it(
    'Under content with an empty title, EditorCore must show the inline error',
    async () => {
      renderEditorCore();

      fireEvent.change(screen.getByRole('textbox', { name: 'Content input' }), {
        target: { value: 'Content only' },
      });

      expect(await screen.findByText('Please enter a title.')).toBeTruthy();
    },
    EDITOR_CORE_TEST_TIMEOUT_MS,
  );

  it(
    'Under a mobile viewport, EditorCore must switch between the Edit and Preview tabs',
    async () => {
      installMatchMediaMock(true);
      renderEditorCore();

      expect(screen.getByRole('tab', { name: 'Edit' })).toBeTruthy();
      expect(screen.getByRole('tab', { name: 'Preview' })).toBeTruthy();
      expect(screen.getByRole('textbox', { name: 'Content input' })).toBeTruthy();
      expect(screen.queryByRole('region', { name: 'Content Preview' })).toBeNull();

      fireEvent.click(screen.getByRole('tab', { name: 'Preview' }));

      await waitFor(() => {
        expect(screen.queryByRole('textbox', { name: 'Content input' })).toBeNull();
        expect(screen.getByRole('tab', { name: 'Preview' })).toHaveAttribute(
          'aria-selected',
          'true',
        );
      });
    },
    EDITOR_CORE_TEST_TIMEOUT_MS,
  );

  it(
    'Under a desktop viewport, EditorCore must render the Edit and Preview panes at the same time',
    () => {
      renderEditorCore();

      expect(screen.getByRole('region', { name: 'Content Edit' })).toBeTruthy();
      expect(screen.getByRole('region', { name: 'Content Preview' })).toBeTruthy();
    },
    EDITOR_CORE_TEST_TIMEOUT_MS,
  );

  it(
    'Under hidden locale panels, EditorCore must recalculate height for Title and Description when tabs change',
    async () => {
      renderEditorCore({
        initialTranslations: {
          en: {
            content: '',
            description: 'This English description is long enough to wrap across two lines.',
            title: 'English title that should expand after the tab becomes visible.',
          },
          fr: { content: '', description: '', title: '' },
          ja: { content: '', description: '', title: '' },
          ko: { content: '', description: '', title: '' },
        },
      });

      const enTitleTextarea = document.getElementById('editor-title-en') as HTMLTextAreaElement;
      const enDescriptionTextarea = document.getElementById(
        'editor-description-en',
      ) as HTMLTextAreaElement;

      Object.defineProperty(enTitleTextarea, 'scrollHeight', {
        configurable: true,
        value: 92,
      });
      Object.defineProperty(enDescriptionTextarea, 'scrollHeight', {
        configurable: true,
        value: 76,
      });

      fireEvent.click(screen.getByRole('tab', { name: 'EN' }));

      await waitFor(() => {
        expect(enTitleTextarea.style.height).toMatch(/px$/);
        expect(enDescriptionTextarea.style.height).toMatch(/px$/);
      });
    },
    EDITOR_CORE_TEST_TIMEOUT_MS,
  );

  it(
    'Under toolbar input, EditorCore must apply changes only to the active locale textarea',
    async () => {
      renderEditorCore();

      fireEvent.click(screen.getByRole('tab', { name: 'EN' }));

      const textarea = screen.getByRole('textbox', {
        name: 'Content input',
      }) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'OpenAI' } });
      textarea.setSelectionRange(0, 6);

      fireEvent.click(screen.getByRole('button', { name: 'Bold' }));

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Content input' })).toHaveValue('**OpenAI**');
      });

      fireEvent.click(screen.getByRole('tab', { name: 'KO' }));

      expect(screen.getByRole('textbox', { name: 'Content input' })).toHaveValue('');
    },
    EDITOR_CORE_TEST_TIMEOUT_MS,
  );

  it(
    'Under a manual save, EditorCore must pass the current editor state snapshot',
    async () => {
      const onDraftSave = vi.fn().mockResolvedValue(undefined);

      renderEditorCore({ onDraftSave });

      fireEvent.change(getTitleInput('KO'), {
        target: { value: 'Save Title' },
      });
      fireEvent.change(screen.getByRole('textbox', { name: 'Content input' }), {
        target: { value: 'Save Content' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Select React tag' }));

      fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));

      await waitFor(() => {
        expect(onDraftSave).toHaveBeenCalledWith(
          expect.objectContaining({
            dirty: true,
            slug: '',
            tags: ['react'],
            translations: expect.objectContaining({
              ko: expect.objectContaining({
                content: 'Save Content',
                title: 'Save Title',
              }),
            }),
          }),
        );
      });
    },
    EDITOR_CORE_TEST_TIMEOUT_MS,
  );

  it(
    'Under autosave, EditorCore must run only once 180 seconds after the last input',
    async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-03-12T09:07:00+09:00'));
      const onDraftSave = vi.fn().mockResolvedValue(undefined);

      renderEditorCore({ onDraftSave });

      fireEvent.change(getTitleInput('KO'), {
        target: { value: 'autosave title' },
      });
      fireEvent.change(screen.getByRole('textbox', { name: 'Content input' }), {
        target: { value: 'autosave body' },
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(179_999);
      });
      expect(onDraftSave).not.toHaveBeenCalled();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });

      expect(onDraftSave).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('status')).toHaveTextContent('Saved 09:10');
    },
    EDITOR_CORE_TEST_TIMEOUT_MS,
  );

  it(
    'Under a save failure, EditorCore must show a toast and keep the editor dirty',
    async () => {
      const onDraftSave = vi.fn().mockRejectedValue(new Error('save failed'));

      renderEditorCore({ onDraftSave });

      fireEvent.change(getTitleInput('KO'), {
        target: { value: 'Failed title' },
      });
      fireEvent.change(screen.getByRole('textbox', { name: 'Content input' }), {
        target: { value: 'Failed content' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));

      expect(
        await screen.findByText('Failed to save the draft. Please try again later.'),
      ).toBeTruthy();
      expect(screen.getByRole('status')).toHaveTextContent('Unsaved changes');
    },
    EDITOR_CORE_TEST_TIMEOUT_MS,
  );

  it(
    'Under an unsaveable state, direct publish must not run and must show a toast',
    async () => {
      const onDirectPublish = vi.fn().mockResolvedValue(undefined);

      renderEditorCore({
        onDirectPublish,
        onDraftSave: undefined,
        onOpenPublishPanel: undefined,
      });

      fireEvent.click(screen.getByRole('button', { name: 'Publish' }));

      await waitFor(() => {
        expect(onDirectPublish).not.toHaveBeenCalled();
        expect(
          screen.getByText(
            'At least one language version with both a title and content is required to save.',
          ),
        ).toBeTruthy();
      });
    },
    EDITOR_CORE_TEST_TIMEOUT_MS,
  );
});
