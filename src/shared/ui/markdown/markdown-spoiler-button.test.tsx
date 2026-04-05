import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { MarkdownSpoilerButton } from '@/shared/ui/markdown/markdown-spoiler-button';

describe('MarkdownSpoilerButton', () => {
  it('Under spoiler rendering, MarkdownSpoilerButton must render as a button and toggle open and closed on click', () => {
    render(<MarkdownSpoilerButton>Spoiler</MarkdownSpoilerButton>);

    const spoilerButton = screen.getByRole('button', { name: /Spoiler/ });

    expect(spoilerButton.getAttribute('aria-expanded')).toBe('false');
    expect(spoilerButton.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Hidden content');

    fireEvent.click(spoilerButton);

    expect(screen.getByRole('button', { name: /Spoiler/ })).toBeTruthy();
    expect(spoilerButton.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('status').textContent).toContain('Spoiler is open.');
  });
});
