/** @vitest-environment jsdom */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { renderRichMarkdown } from '@/shared/lib/markdown/rich-markdown';

/**
 * Test renderer that renders a rich-markdown fragment as a plain text div.
 *
 * @param markdown Markdown fragment to render.
 * @param key React key.
 * @returns Returns the fragment node for tests.
 */
const renderMarkdownFragment = (markdown: string, key: string) => (
  <div data-fragment="true" key={key}>
    {markdown}
  </div>
);

describe('rich-markdown renderer registry', () => {
  it('Under a custom video renderer override, renderRichMarkdown must render the overridden node instead of the default video renderer', () => {
    render(
      <div>
        {renderRichMarkdown({
          markdown: '<Video provider="youtube" id="dQw4w9WgXcQ" />',
          renderMarkdownFragment,
          renderers: {
            video: ({ key, segment }) => (
              <div data-custom-video="true" key={key}>
                {segment.provider === 'youtube' ? segment.videoId : ''}
              </div>
            ),
          },
        })}
      </div>,
    );

    expect(screen.getByText('dQw4w9WgXcQ')).toBeTruthy();
    expect(document.querySelector('[data-custom-video="true"]')).toBeTruthy();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('Under nested toggle content, renderRichMarkdown must recursively reuse the same custom renderer registry', () => {
    render(
      <div>
        {renderRichMarkdown({
          markdown: [
            ':::toggle ## Title',
            '<Video provider="youtube" id="dQw4w9WgXcQ" />',
            ':::',
          ].join('\n'),
          renderMarkdownFragment,
          renderers: {
            video: ({ key, segment }) => (
              <div data-custom-video="true" key={key}>
                {segment.provider === 'youtube' ? segment.videoId : ''}
              </div>
            ),
          },
        })}
      </div>,
    );

    expect(document.querySelector('[data-custom-video="true"]')).toBeTruthy();
    expect(document.querySelector('details')).toBeTruthy();
    expect(document.querySelector('iframe')).toBeNull();
  });
});
