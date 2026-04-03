import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import { Button } from '@/shared/ui/button/button';

import '@testing-library/jest-dom/vitest';

describe('Button', () => {
  it('Under icon and label props, Button must render both the icon and label', () => {
    render(
      <Button leadingVisual={<svg aria-hidden viewBox="0 0 16 16" />} tone="primary">
        Save
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
  });

  it('Under disabled state, Button must reflect it in the button attributes', () => {
    render(
      <Button disabled tone="black">
        Disabled
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Disabled' })).toHaveProperty('disabled', true);
  });

  it('Under asChild with a single custom element, Button must style the element', () => {
    render(
      <Button asChild tone="white" variant="ghost">
        <span role="button">Project</span>
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Project' })).toBeTruthy();
  });

  it('Under a disabled asChild anchor, Button must provide aria-disabled and click protection', () => {
    const handleClick = vi.fn();
    const AnchorLike = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />;

    render(
      <Button asChild disabled tone="white" variant="ghost">
        <AnchorLike href="https://example.com/project" onClick={handleClick}>
          Project
        </AnchorLike>
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Project' });
    fireEvent.click(link);

    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('Under an asChild native button, Button must pass through the type prop', () => {
    render(
      <Button asChild tone="primary" type="submit">
        <button>Save</button>
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit');
  });

  it('Under invalid asChild content, Button must throw an error', () => {
    expect(() =>
      render(
        <Button asChild tone="white">
          Text
        </Button>,
      ),
    ).toThrow('Button with asChild requires a single React element child.');
  });

  it('Under an external className, Input must merge it with the base recipe class', () => {
    render(
      <Button className="custom-class" tone="primary">
        Merged
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Merged' }).className).toContain('custom-class');
  });

  it('Under slot className overrides, Button must merge them into the label and visual slots', () => {
    render(
      <Button
        labelClassName="button-label-override"
        leadingVisual={<svg aria-hidden data-testid="leading-icon" viewBox="0 0 16 16" />}
        leadingVisualClassName="button-leading-override"
        tone="primary"
        trailingVisual={<svg aria-hidden data-testid="trailing-icon" viewBox="0 0 16 16" />}
        trailingVisualClassName="button-trailing-override"
      >
        Save
      </Button>,
    );

    expect(screen.getByText('Save').className).toContain('button-label-override');
    expect(screen.getByTestId('leading-icon').parentElement?.className).toContain(
      'button-leading-override',
    );
    expect(screen.getByTestId('trailing-icon').parentElement?.className).toContain(
      'button-trailing-override',
    );
  });
});
