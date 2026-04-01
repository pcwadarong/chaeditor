import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { LinkEmbedPopover } from '@/features/edit-markdown/ui/link-embed-popover';

type PopoverMockProps = {
  children: React.ReactNode | ((args: { closePopover: () => void }) => React.ReactNode);
  triggerAriaLabel?: string;
  triggerContent?: React.ReactNode;
};

vi.mock('@/shared/ui/popover/popover', () => ({
  Popover: ({ children, triggerAriaLabel, triggerContent }: PopoverMockProps) => (
    <div>
      <button aria-label={triggerAriaLabel} type="button">
        {triggerContent ?? triggerAriaLabel}
      </button>
      {typeof children === 'function' ? children({ closePopover: vi.fn() }) : children}
    </div>
  ),
}));

describe('LinkEmbedPopover', () => {
  it('Under trimmed URL input, LinkEmbedPopover must call onApply with the normalized value and selected mode', () => {
    const onApply = vi.fn();

    render(<LinkEmbedPopover onApply={onApply} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Link URL' }), {
      target: { value: '  https://openai.com  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Hyperlink' }));

    expect(onApply).toHaveBeenCalledWith('https://openai.com', 'link', expect.any(Function));
  });

  it('Under whitespace-only input, LinkEmbedPopover must not call onApply', () => {
    const onApply = vi.fn();

    render(<LinkEmbedPopover onApply={onApply} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Link URL' }), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Hyperlink' }));

    expect(onApply).not.toHaveBeenCalled();
  });

  it('Under custom labels, LinkEmbedPopover must render the overridden text', () => {
    const onApply = vi.fn();

    render(
      <LinkEmbedPopover
        labels={{
          cardButtonLabel: 'Card link',
          hyperlinkButtonLabel: 'Plain link',
          panelLabel: 'Add link',
          previewButtonLabel: 'Preview link',
          triggerAriaLabel: 'Add link',
          triggerTooltip: 'Add link',
          urlInputAriaLabel: 'Custom link URL',
          urlPlaceholder: 'https://custom.example.com',
        }}
        onApply={onApply}
      />,
    );

    expect(screen.getByRole('button', { name: 'Add link' })).toBeTruthy();
    expect(
      screen.getByRole('textbox', { name: 'Custom link URL' }).getAttribute('placeholder'),
    ).toBe('https://custom.example.com');
    expect(screen.getByRole('button', { name: 'Preview link' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Plain link' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Card link' })).toBeTruthy();
  });
});
