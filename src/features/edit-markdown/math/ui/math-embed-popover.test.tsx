import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { MathEmbedPopover } from '@/features/edit-markdown/math';

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

describe('MathEmbedPopover', () => {
  it('Under the fraction template action, MathEmbedPopover must fill the default fraction formula', () => {
    render(<MathEmbedPopover onApply={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Fraction' }));

    const textbox = screen.getByRole('textbox', { name: 'LaTeX formula' }) as HTMLTextAreaElement;

    expect(textbox.value).toBe('\\frac{a}{b}');
    expect(document.activeElement).toBe(textbox);
    expect(textbox.selectionStart).toBe('\\frac{'.length);
    expect(textbox.selectionEnd).toBe('\\frac{'.length + 1);
  });

  it('Under a formula input value, MathEmbedPopover must send an inline formula to onApply', () => {
    const onApply = vi.fn();

    render(<MathEmbedPopover onApply={onApply} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'LaTeX formula' }), {
      target: { value: 'a^2 + b^2 = c^2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Inline' }));

    expect(onApply).toHaveBeenCalledWith('a^2 + b^2 = c^2', false, expect.any(Function));
  });

  it('Under whitespace-only input, MathEmbedPopover must not call the insert callback', () => {
    const onApply = vi.fn();

    render(<MathEmbedPopover onApply={onApply} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'LaTeX formula' }), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Block' }));

    expect(onApply).not.toHaveBeenCalled();
  });

  it('Under the cases template, MathEmbedPopover must insert a block formula', () => {
    const onApply = vi.fn();

    render(<MathEmbedPopover onApply={onApply} />);

    fireEvent.click(screen.getByRole('button', { name: 'cases' }));
    fireEvent.click(screen.getByRole('button', { name: 'Block' }));

    expect(onApply).toHaveBeenCalledWith(
      '\\begin{cases} x, &x \\ge 0 \\\\ -x, &x < 0 \\end{cases}',
      true,
      expect.any(Function),
    );
  });

  it('Under the cases template action, MathEmbedPopover must immediately select the editable body', () => {
    render(<MathEmbedPopover onApply={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'cases' }));

    const textbox = screen.getByRole('textbox', { name: 'LaTeX formula' }) as HTMLTextAreaElement;

    expect(textbox.value.slice(textbox.selectionStart, textbox.selectionEnd)).toBe(
      ' x, &x \\ge 0 \\\\ -x, &x < 0',
    );
  });

  it('Under the integral template action, MathEmbedPopover must select the editable function segment', () => {
    render(<MathEmbedPopover onApply={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Integral' }));

    const textbox = screen.getByRole('textbox', { name: 'LaTeX formula' }) as HTMLTextAreaElement;

    expect(textbox.value).toBe('\\int_{a}^{b} f(x) \\, dx');
    expect(textbox.value.slice(textbox.selectionStart, textbox.selectionEnd)).toBe('f(x)');
  });
});
