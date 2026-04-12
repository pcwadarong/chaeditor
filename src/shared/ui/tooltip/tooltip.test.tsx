import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { Tooltip } from '@/shared/ui/tooltip/tooltip';

describe('Tooltip', () => {
  it('Under focus, Tooltip must open and connect the trigger with aria-describedby', async () => {
    render(
      <Tooltip content="Bold">
        <button type="button">B</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'B' });
    fireEvent.focus(trigger);

    const tooltip = await screen.findByRole('tooltip', { name: 'Bold' });

    expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id);
  });

  it('Under blur, Tooltip must close', async () => {
    render(
      <Tooltip content="Italic">
        <button type="button">I</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'I' });
    fireEvent.focus(trigger);
    await screen.findByRole('tooltip', { name: 'Italic' });

    fireEvent.blur(trigger);

    await waitFor(() => {
      expect(screen.queryByRole('tooltip', { name: 'Italic' })).toBeNull();
    });
  });

  it('Under portal mode, Tooltip must render into document.body', async () => {
    render(
      <Tooltip content="Link">
        <button type="button">L</button>
      </Tooltip>,
    );

    fireEvent.focus(screen.getByRole('button', { name: 'L' }));

    const tooltip = await screen.findByRole('tooltip', { name: 'Link' });

    expect(tooltip.parentElement).toBe(document.body);
  });

  it('Under either hover or focus remaining active, Tooltip must stay visible', async () => {
    render(
      <Tooltip content="Align">
        <button type="button">A</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'A' });

    fireEvent.mouseEnter(trigger);
    await screen.findByRole('tooltip', { name: 'Align' });
    fireEvent.focus(trigger);
    fireEvent.mouseLeave(trigger);

    expect(screen.getByRole('tooltip', { name: 'Align' })).toBeTruthy();

    fireEvent.blur(trigger);

    await waitFor(() => {
      expect(screen.queryByRole('tooltip', { name: 'Align' })).toBeNull();
    });
  });

  it('Under a trigger near the top of the viewport, Tooltip must place itself below', async () => {
    render(
      <Tooltip content="YouTube" preferredPlacement="auto" viewportPadding={8}>
        <button type="button">Y</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Y' });
    const root = trigger.parentElement as HTMLSpanElement;

    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({
      bottom: 20,
      height: 16,
      left: 10,
      right: 30,
      toJSON: () => undefined,
      top: 4,
      width: 20,
      x: 10,
      y: 4,
    });

    fireEvent.focus(trigger);

    const tooltip = await screen.findByRole('tooltip', { name: 'YouTube' });
    vi.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue({
      bottom: 60,
      height: 32,
      left: 0,
      right: 100,
      toJSON: () => undefined,
      top: 28,
      width: 100,
      x: 0,
      y: 28,
    });

    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      expect(tooltip.style.top).toBe('28px');
      expect(tooltip.style.left).toBe('8px');
    });
  });

  it('Under openOnFocus false, Tooltip must not change state from focus and blur alone', () => {
    render(
      <Tooltip content="Image Zoom out" openOnFocus={false}>
        <button type="button">-</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: '-' });

    fireEvent.focus(trigger);
    expect(screen.queryByRole('tooltip', { name: 'Image Zoom out' })).toBeNull();

    fireEvent.blur(trigger);
    expect(screen.queryByRole('tooltip', { name: 'Image Zoom out' })).toBeNull();

    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole('tooltip', { name: 'Image Zoom out' })).toBeTruthy();

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole('tooltip', { name: 'Image Zoom out' })).toBeNull();
  });

  it('Under a provided portalClassName, Tooltip must merge it into the portal element class', async () => {
    render(
      <Tooltip content="Copy link" portalClassName="tooltip-portal-test">
        <button type="button">C</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'C' });
    fireEvent.focus(trigger);

    const tooltip = await screen.findByRole('tooltip', { name: 'Copy link' });

    expect(tooltip.className).toContain('tooltip-portal-test');
  });

  it('Under preferredPlacement top, Tooltip must stay above even when the top margin is narrow', async () => {
    render(
      <Tooltip content="Image action" preferredPlacement="top" viewportPadding={8}>
        <button type="button">T</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'T' });
    const root = trigger.parentElement as HTMLSpanElement;

    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({
      bottom: 20,
      height: 16,
      left: 10,
      right: 30,
      toJSON: () => undefined,
      top: 4,
      width: 20,
      x: 10,
      y: 4,
    });

    fireEvent.focus(trigger);

    const tooltip = await screen.findByRole('tooltip', { name: 'Image action' });
    vi.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue({
      bottom: 28,
      height: 28,
      left: 0,
      right: 120,
      toJSON: () => undefined,
      top: 0,
      width: 120,
      x: 0,
      y: 0,
    });

    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      expect(tooltip.style.top).toBe('8px');
    });
  });

  it('Under a trigger near the right edge, Tooltip must shift left to stay inside the viewport', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 320,
      writable: true,
    });

    render(
      <Tooltip content="Open helper" preferredPlacement="top" viewportPadding={12}>
        <button type="button">H</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'H' });
    const root = trigger.parentElement as HTMLSpanElement;

    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({
      bottom: 64,
      height: 20,
      left: 290,
      right: 310,
      toJSON: () => undefined,
      top: 44,
      width: 20,
      x: 290,
      y: 44,
    });

    fireEvent.focus(trigger);

    const tooltip = await screen.findByRole('tooltip', { name: 'Open helper' });
    vi.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue({
      bottom: 28,
      height: 28,
      left: 0,
      right: 120,
      toJSON: () => undefined,
      top: 0,
      width: 120,
      x: 0,
      y: 0,
    });

    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      expect(tooltip.style.left).toBe('188px');
    });
  });
});
