import { render, screen } from '@testing-library/react';
import React from 'react';

import { Input } from '@/shared/ui/input/input';

describe('Input', () => {
  it('Under default rendering, Input must render the input field', () => {
    render(<Input aria-label="Search query" placeholder="Enter a search query" type="search" />);

    expect(screen.getByRole('searchbox', { name: 'Search query' })).toBeTruthy();
  });

  it('Under an external className, Input must merge it with the base recipe class', () => {
    render(<Input aria-label="Name" className="custom-class" type="text" />);

    expect(screen.getByLabelText('Name').className).toContain('custom-class');
  });
});
