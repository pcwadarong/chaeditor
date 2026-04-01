import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { MarkdownMermaid } from '@/shared/ui/markdown/markdown-mermaid';

const initialize = vi.fn();
const renderMermaid = vi.fn();

vi.mock('mermaid', () => ({
  default: {
    initialize,
    render: renderMermaid,
  },
}));

describe('MarkdownMermaid', () => {
  beforeEach(() => {
    initialize.mockReset();
    renderMermaid.mockReset();
  });

  it('Under valid Mermaid source, MarkdownMermaid must render an SVG diagram', async () => {
    renderMermaid.mockResolvedValue({
      svg: '<svg aria-label="Mermaid diagram"><g /></svg>',
    });

    const { container } = render(<MarkdownMermaid chart={'flowchart TD\nA-->B'} />);

    await waitFor(() => {
      expect(container.querySelector('svg[aria-label="Mermaid diagram"]')).toBeTruthy();
    });

    expect(initialize).toHaveBeenCalled();
    expect(renderMermaid).toHaveBeenCalledWith(
      expect.stringMatching(/^markdown-mermaid-/),
      'flowchart TD\nA-->B',
    );
  });

  it('Under valid Mermaid source, MarkdownMermaid must let users view the diagram and source through the source toggle', async () => {
    renderMermaid.mockResolvedValue({
      svg: '<svg aria-label="Mermaid diagram"><g /></svg>',
    });

    const { container } = render(<MarkdownMermaid chart={'flowchart TD\nA-->B'} />);

    await waitFor(() => {
      expect(container.querySelector('svg[aria-label="Mermaid diagram"]')).toBeTruthy();
    });

    expect(screen.queryByText('flowchart TD\nA-->B')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'View source' }));

    expect(container.querySelector('pre')?.textContent).toBe('flowchart TD\nA-->B');
    expect(container.querySelector('svg[aria-label="Mermaid diagram"]')).toBeTruthy();
  });

  it('Under a rendering error, MarkdownMermaid must show an error message and source code fallback', async () => {
    renderMermaid.mockRejectedValue(new Error('parse failed'));

    const { container } = render(<MarkdownMermaid chart={'flowchart TD\nA-->B'} />);

    expect((await screen.findByRole('alert')).textContent).toContain('Mermaid render error');
    expect(container.querySelector('pre')?.textContent).toBe('flowchart TD\nA-->B');
  });
});
