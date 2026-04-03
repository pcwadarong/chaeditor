import { render, screen } from '@testing-library/react';
import React from 'react';

import {
  MarkdownPrimitiveProvider,
  useMarkdownPrimitives,
} from '@/shared/ui/primitive-registry/markdown-primitive-registry';

const PrimitiveProbe = () => {
  const { Button } = useMarkdownPrimitives();

  return <Button aria-label="Probe button">Probe</Button>;
};

describe('MarkdownPrimitiveProvider', () => {
  it('Under a custom primitive registry, MarkdownPrimitiveProvider must expose the overridden primitive to descendants', () => {
    const renderCustomButton: React.ForwardRefRenderFunction<
      HTMLButtonElement,
      React.ComponentPropsWithoutRef<'button'>
    > = ({ children, ...props }, ref) => (
      <button data-primitive="custom-button" ref={ref} type="button" {...props}>
        {children}
      </button>
    );

    const CustomButton = React.forwardRef(renderCustomButton);
    CustomButton.displayName = 'CustomButton';

    render(
      <MarkdownPrimitiveProvider registry={{ Button: CustomButton }}>
        <PrimitiveProbe />
      </MarkdownPrimitiveProvider>,
    );

    expect(
      screen.getByRole('button', { name: 'Probe button' }).getAttribute('data-primitive'),
    ).toBe('custom-button');
  });
});
