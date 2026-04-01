import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { Textarea } from '@/shared/ui/textarea/textarea';

describe('Textarea', () => {
  it('Under auto resize, Textarea must adjust its height to match the content height', () => {
    render(<Textarea aria-label="Content" defaultValue="" rows={1} />);

    const textarea = screen.getByLabelText('Content') as HTMLTextAreaElement;
    let nextScrollHeight = 28;

    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      get: () => nextScrollHeight,
    });

    fireEvent.change(textarea, { target: { value: 'First line' } });
    expect(textarea.style.height).toBe('28px');

    nextScrollHeight = 56;
    fireEvent.change(textarea, { target: { value: 'First line\nSecond line' } });
    expect(textarea.style.height).toBe('56px');
  });
});
