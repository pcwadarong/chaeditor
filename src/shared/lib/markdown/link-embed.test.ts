import { extractEmbedMetaFromHtml } from '@/shared/lib/markdown/link-embed';

describe('link-embed utils', () => {
  it('Under reordered meta and link attributes, extractHtmlFallbackMeta must still extract fallback metadata', () => {
    const html = `
      <html>
        <head>
          <meta content="Open Graph Title" property="og:title">
          <meta content="Description" name="description">
          <meta content="OpenAI" property="og:site_name">
          <meta content="/preview.png" property="og:image">
          <link href="/favicon.ico" rel="icon">
          <title>ignored title</title>
        </head>
      </html>
    `;

    expect(extractEmbedMetaFromHtml('https://example.com/docs', html)).toEqual({
      description: 'Description',
      favicon: 'https://example.com/favicon.ico',
      image: 'https://example.com/preview.png',
      siteName: 'OpenAI',
      title: 'Open Graph Title',
      url: 'https://example.com/docs',
    });
  });

  it('Under an attribute value containing the other quote character, extractEmbedMetaFromHtml must not truncate it', () => {
    const html = `<meta property="og:title" content="Don't stop believing">`;

    expect(extractEmbedMetaFromHtml('https://example.com/song', html).title).toBe(
      "Don't stop believing",
    );
  });
});
