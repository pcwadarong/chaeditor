import { render, screen } from '@testing-library/react';
import React from 'react';

import { DownloadFileButton } from '@/shared/ui/download-file-button';

describe('DownloadFileButton', () => {
  it('Under a valid download href, DownloadFileButton must render an anchor with the download target', () => {
    render(
      <DownloadFileButton
        fileName="reference.pdf"
        href="https://chaeditor.dev/reference.pdf"
        label="Download reference"
      />,
    );

    const link = screen.getByRole('link', { name: 'Download reference' });

    expect(link.getAttribute('href')).toBe('https://chaeditor.dev/reference.pdf');
    expect(link.getAttribute('download')).toBe('reference.pdf');
  });

  it('Under a missing href, DownloadFileButton must render a disabled button', () => {
    render(<DownloadFileButton href={null} label="Unavailable" />);

    const button = screen.getByRole('button', { name: 'Unavailable' });

    expect(button).toHaveProperty('disabled', true);
  });
});
