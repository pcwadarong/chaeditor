import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { TextColorPopover } from '@/features/edit-markdown/ui/text-color-popover';

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

describe('TextColorPopover', () => {
  it('Under custom labels, TextColorPopover must render the overridden trigger and option labels', () => {
    const onApply = vi.fn();

    render(
      <TextColorPopover
        labels={{
          getOptionAriaLabel: label => `${label} custom`,
          panelLabel: 'Custom text color',
          triggerAriaLabel: 'Open custom text color',
          triggerTooltip: 'Custom text color tooltip',
        }}
        onApply={onApply}
      />,
    );

    expect(screen.getByRole('button', { name: 'Open custom text color' })).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: /custom$/ })[0] as HTMLButtonElement);

    expect(onApply).toHaveBeenCalled();
  });
});
