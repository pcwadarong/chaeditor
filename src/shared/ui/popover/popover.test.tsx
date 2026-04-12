import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { Popover } from '@/shared/ui/popover/popover';

describe('Popover', () => {
  it('Under popover rendering, Popover must connect the trigger and dialog panel with accessibility attributes', async () => {
    render(
      <Popover label="Language" panelLabel="Choose language" value="Korean">
        {() => <button type="button">Korean</button>}
      </Popover>,
    );

    const trigger = screen.getByRole('button', { name: 'Choose language' });
    fireEvent.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Choose language' });

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(dialog.id);
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(trigger.getAttribute('aria-labelledby')).toBe(dialog.getAttribute('aria-labelledby'));
  });

  it('Under opening, Popover must move focus to the first focusable option', async () => {
    render(
      <Popover label="Theme" panelLabel="Choose theme" value="System">
        {() => (
          <div>
            <button type="button">System</button>
            <button type="button">Light</button>
          </div>
        )}
      </Popover>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Choose theme' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'System' })).toBe(document.activeElement);
    });
  });

  it('Under Escape close, Popover must restore focus to the trigger button', async () => {
    render(
      <Popover label="Theme" panelLabel="Choose theme" value="System">
        {() => <button type="button">System</button>}
      </Popover>,
    );

    const trigger = screen.getByRole('button', { name: 'Choose theme' });
    trigger.focus();

    fireEvent.click(trigger);
    await screen.findByRole('dialog', { name: 'Choose theme' });

    fireEvent.keyDown(window, { cancelable: true, key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Choose theme' })).toBeNull();
      expect(trigger).toBe(document.activeElement);
    });
  });

  it('Under an outside click event, Popover must close', async () => {
    render(
      <Popover label="Theme" panelLabel="Choose theme" value="System">
        {() => <button type="button">System</button>}
      </Popover>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Choose theme' }));
    await screen.findByRole('dialog', { name: 'Choose theme' });

    fireEvent.click(document.body);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Choose theme' })).toBeNull();
    });
  });

  it('Under custom trigger content, Popover must render the custom trigger content', () => {
    render(
      <Popover label="Theme" panelLabel="Choose theme" triggerContent={<span>Icon only</span>}>
        {() => <button type="button">System</button>}
      </Popover>,
    );

    expect(screen.getByRole('button', { name: 'Choose theme' }).textContent).toContain('Icon only');
    expect(screen.queryByText('Theme')).toBeNull();
  });

  it('Under a custom triggerAriaLabel, Popover must use the provided accessible name', () => {
    render(
      <Popover
        panelLabel="Action menu"
        triggerAriaLabel="Open menu"
        triggerContent={<span aria-hidden>...</span>}
      >
        {() => <button type="button">Edit</button>}
      </Popover>,
    );

    expect(screen.getByRole('button', { name: 'Open menu' })).toBeTruthy();
  });

  it('Under portal mode, Popover must render the panel into document.body', async () => {
    render(
      <Popover panelLabel="Link Insert" portalPlacement="start" renderInPortal>
        {() => <button type="button">Insert</button>}
      </Popover>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Link Insert' }));

    const dialog = await screen.findByRole('dialog', { name: 'Link Insert' });

    expect(dialog.parentElement).toBe(document.body);
  });

  it('Under a portal popover near the right edge, Popover must shift the panel left to stay inside the viewport', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 320,
      writable: true,
    });

    render(
      <Popover panelLabel="Link Insert" renderInPortal viewportPadding={12}>
        {() => <button type="button">Insert</button>}
      </Popover>,
    );

    const trigger = screen.getByRole('button', { name: 'Link Insert' });
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      bottom: 80,
      height: 24,
      left: 260,
      right: 300,
      toJSON: () => undefined,
      top: 56,
      width: 40,
      x: 260,
      y: 56,
    });

    fireEvent.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Link Insert' });
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
      bottom: 208,
      height: 120,
      left: 0,
      right: 180,
      toJSON: () => undefined,
      top: 88,
      width: 180,
      x: 0,
      y: 88,
    });

    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      expect(dialog.style.left).toBe('120px');
    });
  });

  it('Under controlled mode, Popover must call onOpenChange and keep the DOM open state unchanged until props change', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Popover isOpen={false} onOpenChange={onOpenChange} panelLabel="Action menu">
        {() => <button type="button">Edit</button>}
      </Popover>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Action menu' }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('dialog', { name: 'Action menu' })).toBeNull();

    rerender(
      <Popover isOpen onOpenChange={onOpenChange} panelLabel="Action menu">
        {() => <button type="button">Edit</button>}
      </Popover>,
    );

    await screen.findByRole('dialog', { name: 'Action menu' });

    fireEvent.keyDown(window, { cancelable: true, key: 'Escape' });
    fireEvent.click(document.body);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('dialog', { name: 'Action menu' })).toBeTruthy();
  });

  it('Under slot className overrides, Popover must merge them into the root trigger label and value slots', () => {
    render(
      <Popover
        label="Theme"
        panelLabel="Choose theme"
        rootClassName="popover-root-override"
        triggerLabelClassName="popover-label-override"
        triggerValueClassName="popover-value-override"
        value="System"
      >
        {() => <button type="button">System</button>}
      </Popover>,
    );

    expect(screen.getByText('Theme').className).toContain('popover-label-override');
    expect(screen.getByText('System').className).toContain('popover-value-override');
    expect(screen.getByRole('button', { name: 'Choose theme' }).parentElement?.className).toContain(
      'popover-root-override',
    );
  });
});
