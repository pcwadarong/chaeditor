import {
  getDuplicateRowIds,
  getFilledImageRows,
  mergeImageRows,
  reorderRows,
  resolvePreviewImageSrc,
} from '@/features/edit-markdown/image/model/image-embed-modal-state';

describe('image-embed-modal-state', () => {
  it('Under rows with valid URLs, getFilledImageRows must return only insertable image items', () => {
    expect(
      getFilledImageRows([
        { alt: 'First', id: 'row-1', url: 'https://example.com/one.png' },
        { alt: '', id: 'row-2', url: '   ' },
      ]),
    ).toEqual([{ altText: 'First', id: 'row-1', url: 'https://example.com/one.png' }]);
  });

  it('Under duplicate URLs, getDuplicateRowIds must return every duplicated row id', () => {
    expect(
      Array.from(
        getDuplicateRowIds([
          { alt: '', id: 'row-1', url: 'https://example.com/dup.png' },
          { alt: '', id: 'row-2', url: 'https://example.com/dup.png' },
          { alt: '', id: 'row-3', url: 'https://example.com/other.png' },
        ]),
      ),
    ).toEqual(['row-1', 'row-2']);
  });

  it('Under existing empty rows, mergeImageRows must fill empty slots first and append the rest', () => {
    expect(
      mergeImageRows(
        [
          { alt: '', id: 'row-1', url: '' },
          { alt: '', id: 'row-2', url: 'https://example.com/existing.png' },
        ],
        [
          { alt: 'Upload 1', id: 'row-3', url: 'https://example.com/uploaded-1.png' },
          { alt: 'Upload 2', id: 'row-4', url: 'https://example.com/uploaded-2.png' },
        ],
      ),
    ).toEqual([
      { alt: 'Upload 1', id: 'row-3', url: 'https://example.com/uploaded-1.png' },
      { alt: '', id: 'row-2', url: 'https://example.com/existing.png' },
      { alt: 'Upload 2', id: 'row-4', url: 'https://example.com/uploaded-2.png' },
    ]);
  });

  it('Under a movable row, reorderRows must move the row by one position', () => {
    expect(
      reorderRows(
        [
          { alt: '', id: 'row-1', url: 'https://example.com/one.png' },
          { alt: '', id: 'row-2', url: 'https://example.com/two.png' },
        ],
        'row-2',
        'up',
      ).map(row => row.id),
    ).toEqual(['row-2', 'row-1']);
  });

  it('Under an https image URL, resolvePreviewImageSrc must return the same URL for preview', () => {
    expect(resolvePreviewImageSrc('https://example.com/preview.png')).toBe(
      'https://example.com/preview.png',
    );
  });

  it('Under a non-https URL, resolvePreviewImageSrc must return null', () => {
    expect(resolvePreviewImageSrc('/relative/path.png')).toBeNull();
  });
});
