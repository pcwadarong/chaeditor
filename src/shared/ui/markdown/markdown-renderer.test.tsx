import { render, screen } from '@testing-library/react';
import { renderToReadableStream } from 'react-dom/server';

import { collectMarkdownImages } from '@/shared/lib/markdown/collect-markdown-images';
import { MarkdownRenderer } from '@/shared/ui/markdown/markdown-renderer';

vi.mock('@/shared/lib/storage/attachment-download-path', () => ({
  resolveAttachmentDownloadHref: vi.fn(({ href }: { href: string }) => href),
}));

/**
 * Collects the server component result into an HTML string.
 */
const renderServerHtml = async (markdown: string) => {
  const element = await MarkdownRenderer({ markdown });
  const stream = await renderToReadableStream(element);

  return new Response(stream).text();
};

/**
 * Parses the server-rendered result into a DOM document.
 */
const renderServerDocument = async (markdown: string) => {
  const html = await renderServerHtml(markdown);

  return new DOMParser().parseFromString(html, 'text/html');
};

describe('MarkdownRenderer', () => {
  it('Under markdown content, the image list helper must build stable image order and viewer ids', () => {
    expect(
      collectMarkdownImages(
        ['![First](https://example.com/one.png)', '![Second](https://example.com/two.png)'].join(
          '\n',
        ),
      ),
    ).toEqual([
      { alt: 'First', src: 'https://example.com/one.png', viewerId: 'markdown-image-0' },
      { alt: 'Second', src: 'https://example.com/two.png', viewerId: 'markdown-image-1' },
    ]);
  });

  it('Under markdown with GFM and code block styles, MarkdownRenderer must render the expected HTML structure', async () => {
    const markdown = [
      '# Title',
      '',
      '#### Small title',
      '',
      '> Quote',
      '',
      '- bullet',
      '  - nested bullet',
      '',
      '1. number',
      '   1. nested number',
      '',
      '[External link](https://example.com)',
      '',
      '| Name | Description |',
      '| --- | --- |',
      '| Markdown | Renderer |',
      '',
      '```ts',
      "const answer = '42';",
      '```',
    ].join('\n');
    const html = await renderServerHtml(markdown);
    const document = await renderServerDocument(markdown);
    const highlightedPre = document.querySelector('pre[data-language="ts"]');
    const markdownTable = document.querySelector('div[aria-label="Markdown table"]');
    const unorderedList = document.querySelector('ul');
    const orderedList = document.querySelector('ol');

    expect(highlightedPre).toBeTruthy();
    expect(highlightedPre?.className).toBeTruthy();
    expect(highlightedPre?.getAttribute('tabindex')).toBe('0');
    expect(highlightedPre?.getAttribute('aria-label')).toBe('Code block: ts');
    expect(highlightedPre?.textContent).toContain("const answer = '42';");
    expect(markdownTable).toBeTruthy();
    expect(markdownTable?.getAttribute('tabindex')).toBe('0');
    expect(unorderedList).toBeTruthy();
    expect(orderedList).toBeTruthy();

    expect(html).toContain('<h1');
    expect(html).toContain('Title</h1>');
    expect(html).toContain('<h4');
    expect(html).toContain('Small title</h4>');
    expect(html).toContain('<blockquote');
    expect(html).toContain('nested bullet');
    expect(html).toContain('nested number');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('<table');
    expect(document.querySelector('[data-link-embed-card="true"]')).toBeNull();
  });

  it('Under a markdown image, MarkdownRenderer must render it as a responsive image viewer trigger', async () => {
    const document = await renderServerDocument(
      '![Description](https://example.com/image.png "Sample")',
    );
    const image = document.querySelector('img[role="button"]');

    expect(image).toBeTruthy();
    expect(image?.getAttribute('src')).toBe('https://example.com/image.png');
    expect(image?.getAttribute('alt')).toBe('Description');
    expect(image?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(image?.className).toBeTruthy();
  });

  it('Under host image viewer labels, MarkdownRenderer must reflect the open label on image triggers', async () => {
    const element = await MarkdownRenderer({
      adapters: {
        imageViewerLabels: {
          actionBarAriaLabel: 'Action bar',
          closeAriaLabel: 'Close',
          fitToScreenAriaLabel: 'Fit to screen',
          imageViewerAriaLabel: 'Custom Image viewer',
          locateSourceAriaLabel: 'Jump to source',
          nextAriaLabel: 'Next',
          openAriaLabel: 'Custom Open',
          previousAriaLabel: 'Previous',
          selectForFrameAriaLabel: 'Select for frame',
          selectForFrameLabel: 'Select frame',
          thumbnailListAriaLabel: 'Thumbnail List',
          zoomInAriaLabel: 'Zoom in',
          zoomOutAriaLabel: 'Zoom out',
        },
      },
      markdown: '![Description](https://example.com/image.png)',
    });
    const stream = await renderToReadableStream(element);
    const html = await new Response(stream).text();
    const document = new DOMParser().parseFromString(html, 'text/html');
    const image = document.querySelector('img[role="button"]');

    expect(image?.getAttribute('aria-label')).toBe('Description · Custom Open');
  });

  it('Under an Attachment tag, MarkdownRenderer must render a download card link', async () => {
    const document = await renderServerDocument(
      '<Attachment href="https://example.com/resume.pdf" name="resume.pdf" size="2048" type="application/pdf" />',
    );
    const attachmentCard = document.querySelector('[data-markdown-attachment="true"]');
    const downloadLink = attachmentCard?.querySelector('a[download="resume.pdf"]');

    expect(attachmentCard).toBeTruthy();
    expect(downloadLink).toBeTruthy();
    expect(downloadLink?.getAttribute('href')).toBe('https://example.com/resume.pdf');
    expect(attachmentCard?.textContent).toContain('resume.pdf');
    expect(attachmentCard?.textContent).toContain('2 KB');
    expect(downloadLink?.textContent).toContain('Download');
  });

  it('Under HTML entities in attachment attributes, MarkdownRenderer must restore the file name and href for rendering', async () => {
    const document = await renderServerDocument(
      '<Attachment href="https://example.com/download?name=R&amp;D&amp;v=2" name="R&amp;D &quot;v2&quot;.pdf" size="2048" type="application/pdf" />',
    );
    const attachmentCard = document.querySelector('[data-markdown-attachment="true"]');
    const downloadLink = attachmentCard?.querySelector('a[download]');

    expect(attachmentCard?.textContent).toContain('R&D "v2".pdf');
    expect(downloadLink?.getAttribute('download')).toBe('R&D "v2".pdf');
    expect(downloadLink?.getAttribute('href')).toBe('https://example.com/download?name=R&D&v=2');
  });

  it('Under a Math tag, MarkdownRenderer must render it as a KaTeX formula', async () => {
    const document = await renderServerDocument('<Math block="true">a^2 + b^2 = c^2</Math>');
    const mathNode = document.querySelector('[data-markdown-math="block"]');

    expect(mathNode).toBeTruthy();
    expect(mathNode?.querySelector('.katex')).toBeTruthy();
    expect(mathNode?.textContent).toContain('a');
    expect(mathNode?.textContent).toContain('b');
    expect(mathNode?.textContent).toContain('c');
  });

  it('Under inline Math in the middle of a sentence, MarkdownRenderer must render it as KaTeX while preserving surrounding spacing', async () => {
    const document = await renderServerDocument('The sum is <Math>a^2 + b^2</Math> done');
    const wrapper = document.querySelector('div');
    const inlineMathNode = document.querySelector('[data-markdown-math="inline"]');

    expect(wrapper?.textContent).toContain('The sum is');
    expect(wrapper?.textContent).toContain('done');
    expect(inlineMathNode).toBeTruthy();
    expect(inlineMathNode?.querySelector('.katex')).toBeTruthy();
  });

  it('Under multiple inline Math segments, MarkdownRenderer must render each one independently', async () => {
    const document = await renderServerDocument(
      'The first term is <Math>a^2</Math> and the second term is <Math>b^2</Math>.',
    );
    const inlineMathNodes = Array.from(document.querySelectorAll('[data-markdown-math="inline"]'));

    expect(inlineMathNodes).toHaveLength(2);
    expect(inlineMathNodes[0]?.textContent).toContain('a');
    expect(inlineMathNodes[1]?.textContent).toContain('b');
  });

  it('Under invalid inline formula, MarkdownRenderer must render the raw source with an error hint as fallback', async () => {
    const document = await renderServerDocument('The sum is <Math>\\fra{a}{b}</Math> done');
    const inlineMathNode = document.querySelector('[data-markdown-math="inline"]');

    expect(inlineMathNode).toBeTruthy();
    expect(inlineMathNode?.getAttribute('data-markdown-math-error')).toBe('true');
    expect(inlineMathNode?.textContent).toContain('\\fra{a}{b}');
    expect(inlineMathNode?.textContent).toContain('Formula error');
    expect(inlineMathNode?.querySelector('.katex')).toBeNull();
  });

  it('Under invalid block formula, MarkdownRenderer must render the raw source with a detailed error fallback', async () => {
    const document = await renderServerDocument('<Math block="true">\\begin{cases} x </Math>');
    const blockMathNode = document.querySelector('[data-markdown-math="block"]');

    expect(blockMathNode).toBeTruthy();
    expect(blockMathNode?.getAttribute('data-markdown-math-error')).toBe('true');
    expect(blockMathNode?.textContent).toContain('\\begin{cases} x');
    expect(blockMathNode?.textContent).toContain('Formula error');
    expect(blockMathNode?.querySelector('.katex')).toBeNull();
  });

  it('Under a gallery block, MarkdownRenderer must render an image gallery with slider controls and progress state', async () => {
    const document = await renderServerDocument(
      [
        ':::gallery',
        '![First](https://example.com/one.png)',
        '![Second](https://example.com/two.png)',
        ':::',
      ].join('\n'),
    );
    const gallery = document.querySelector('[data-markdown-gallery="true"]');
    const images = Array.from(gallery?.querySelectorAll('img') ?? []);
    const progress = gallery?.querySelector('[aria-label="Image 1 of 2"]');

    expect(gallery).toBeTruthy();
    expect(gallery?.getAttribute('data-markdown-gallery-count')).toBe('2');
    expect(images).toHaveLength(2);
    expect(images[0]?.getAttribute('src')).toBe('https://example.com/one.png');
    expect(images[1]?.getAttribute('src')).toBe('https://example.com/two.png');
    expect(images[0]?.getAttribute('alt')).toBe('First');
    expect(images[1]?.getAttribute('alt')).toBe('Second');
    expect(gallery?.querySelector('button[aria-label="Previous Image"]')).toBeTruthy();
    expect(gallery?.querySelector('button[aria-label="Next Image"]')).toBeTruthy();
    expect(progress).toBeTruthy();
    expect(progress?.getAttribute('role')).toBe('progressbar');
    expect(progress?.getAttribute('aria-valuenow')).toBe('1');
  });

  it('Under a regular image after a gallery, MarkdownRenderer must keep the regular image viewer ids independent from the gallery', async () => {
    const document = await renderServerDocument(
      [
        ':::gallery',
        '![First](https://example.com/one.png)',
        '![Second](https://example.com/two.png)',
        ':::',
        '',
        '![Content Image](https://example.com/standalone.png)',
      ].join('\n'),
    );

    const standaloneImage = document.querySelector(
      'img[data-markdown-viewer-id="markdown-image-0"][src="https://example.com/standalone.png"]',
    );

    expect(standaloneImage).toBeTruthy();
  });

  it('Under the new Video syntax, MarkdownRenderer must render the YouTube iframe', async () => {
    const document = await renderServerDocument('<Video provider="youtube" id="dQw4w9WgXcQ" />');
    const iframe = document.querySelector('iframe');

    expect(iframe).toBeTruthy();
    expect(iframe?.getAttribute('src')).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('Under an invalid YouTube video id, MarkdownRenderer must not render an iframe', async () => {
    const document = await renderServerDocument('<Video provider="youtube" id="invalid-script" />');

    expect(document.querySelector('iframe')).toBeNull();
  });

  it('Under upload video syntax, MarkdownRenderer must render an HTML video element', async () => {
    const document = await renderServerDocument(
      '<Video provider="upload" src="https://example.com/videos/demo.mp4" />',
    );
    const video = document.querySelector('video');

    expect(video).toBeTruthy();
    expect(video?.getAttribute('src')).toBe('https://example.com/videos/demo.mp4');
    expect(video?.getAttribute('controls')).not.toBeNull();
  });

  it('Under legacy YouTube syntax, MarkdownRenderer must keep rendering the YouTube iframe for backward compatibility', async () => {
    const document = await renderServerDocument('<YouTube id="dQw4w9WgXcQ" />');
    const iframe = document.querySelector('iframe');

    expect(iframe).toBeTruthy();
    expect(iframe?.getAttribute('src')).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('Under a Mermaid fenced code block, MarkdownRenderer must render the Mermaid preview frame', async () => {
    const document = await renderServerDocument(
      ['```mermaid', 'flowchart TD', 'A --> B', '```'].join('\n'),
    );
    const mermaidFrame = document.querySelector('[data-markdown-mermaid="true"]');

    expect(mermaidFrame).toBeTruthy();
    expect(mermaidFrame?.textContent).toContain('Mermaid');
  });

  it('Under a provided locale, MarkdownRenderer must pass the lang attribute to the markdown wrapper', async () => {
    const element = await MarkdownRenderer({
      locale: 'ja',
      markdown: 'Japanese content',
    });
    const stream = await renderToReadableStream(element);
    const html = await new Response(stream).text();
    const document = new DOMParser().parseFromString(html, 'text/html');

    expect(document.querySelector('div[lang="ja"]')).toBeTruthy();
  });

  it('Under images inside a table, MarkdownRenderer must apply the same image style so they shrink within the cell width', async () => {
    const document = await renderServerDocument(
      [
        '| Image | Description |',
        '| --- | --- |',
        '| ![Table image](https://example.com/table-image.png) | Image inside cell |',
      ].join('\n'),
    );
    const tableImage = document.querySelector('table img');
    const markdownTable = document.querySelector('div[aria-label="Markdown table"]');

    expect(markdownTable).toBeTruthy();
    expect(tableImage).toBeTruthy();
    expect(tableImage?.className).toBeTruthy();
  });

  it('Under a single line break, MarkdownRenderer must render a br element', async () => {
    const document = await renderServerDocument(['First line', 'Second line'].join('\n'));
    const paragraph = document.querySelector('p');
    const lineBreak = document.querySelector('p br');

    expect(paragraph).toBeTruthy();
    expect(lineBreak).toBeTruthy();
    expect(paragraph?.textContent).toBe('First line\nSecond line');
  });

  it('Under a literal br tag, MarkdownRenderer must normalize it into a markdown line break before rendering', async () => {
    const document = await renderServerDocument('First line<br />Second line');
    const lineBreak = document.querySelector('p br');

    expect(lineBreak).toBeTruthy();
    expect(document.querySelector('p')?.textContent).toBe('First line\nSecond line');
  });

  it('Under Enter after a trailing literal <br/>, MarkdownRenderer must preserve both the hard break and the next line separation', async () => {
    const document = await renderServerDocument(['First line<br/>', 'Second line'].join('\n'));
    const paragraphs = Array.from(document.querySelectorAll('p'));

    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]?.textContent).toBe('First line');
    expect(paragraphs[1]?.textContent).toBe('Second line');
  });

  it('Under a literal hr tag, MarkdownRenderer must normalize it into a divider before rendering', async () => {
    const document = await renderServerDocument('Above paragraph\n\n<hr />\n\nBelow paragraph');

    expect(document.querySelector('hr')).toBeTruthy();
  });

  it('Under custom syntax and HTML aliases inside a fenced code block, MarkdownRenderer must keep them as plain code text', async () => {
    const markdown = [
      '```md',
      ':::toggle ## Example title',
      'Toggle Content',
      ':::',
      '',
      ':::align center',
      'Align Content',
      ':::',
      '',
      '-# Subtext',
      '<br />',
      '<hr />',
      '```',
    ].join('\n');
    const document = await renderServerDocument(markdown);
    const codeBlock = document.querySelector('pre code');

    expect(codeBlock?.textContent).toContain(':::toggle ## Example title');
    expect(codeBlock?.textContent).toContain(':::align center');
    expect(codeBlock?.textContent).toContain('-# Subtext');
    expect(codeBlock?.textContent).toContain('<br />');
    expect(codeBlock?.textContent).toContain('<hr />');
    expect(document.querySelector('details')).toBeNull();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('Under a fenced code block without a language class, MarkdownRenderer must keep it as block code', async () => {
    const document = await renderServerDocument(['```', 'plain block', '```'].join('\n'));
    const blockCode = document.querySelector('pre code');

    expect(blockCode).toBeTruthy();
    expect(blockCode?.textContent).toContain('plain block');
    expect(blockCode?.closest('pre')).toBeTruthy();
    expect(blockCode?.getAttribute('style') ?? '').not.toContain('background-color');
  });

  it('Under a plaintext fenced code block, MarkdownRenderer must render the code class without additional inline color', async () => {
    const document = await renderServerDocument(['```', 'plain block', '```'].join('\n'));
    const blockCode = document.querySelector('pre code');

    expect(blockCode?.className).toBeTruthy();
    expect(blockCode?.getAttribute('style') ?? '').not.toContain('color:rgb(248, 250, 252)');
  });

  it('Under inline code, MarkdownRenderer must not transform custom syntax or HTML aliases', async () => {
    const markdown = [
      '`||Spoiler||`',
      '',
      '`<span style="color:#3B82F6">Blue text</span>`',
      '',
      '`<br />`',
      '',
      '`<hr />`',
    ].join('\n');
    const document = await renderServerDocument(markdown);
    const inlineCodes = Array.from(document.querySelectorAll('code'));

    expect(inlineCodes.map(node => node.textContent)).toEqual([
      '||Spoiler||',
      '<span style="color:#3B82F6">Blue text</span>',
      '<br />',
      '<hr />',
    ]);
    expect(inlineCodes.every(node => node.closest('pre') === null)).toBe(true);
    expect(document.querySelector('button[aria-expanded]')).toBeNull();
    expect(document.querySelector('hr')).toBeNull();
  });

  it('Under inline code, MarkdownRenderer must render it with the dedicated class and no inline styles', async () => {
    const document = await renderServerDocument('`inline code`');
    const inlineCode = document.querySelector('p code');

    expect(inlineCode?.className).toBeTruthy();
    expect(inlineCode?.getAttribute('style')).toBeNull();
  });

  it('Under empty content, MarkdownRenderer must render the fallback text', async () => {
    const element = await MarkdownRenderer({
      emptyText: 'No content available.',
      markdown: null,
    });

    render(element);

    expect(screen.getByText('No content available.')).toBeTruthy();
  });

  it('Under spoiler syntax, MarkdownRenderer must render a button in preview', async () => {
    const document = await renderServerDocument('||Spoiler||');
    const spoilerButton = document.querySelector('button[aria-expanded]');
    const spoilerStatus = document.querySelector('[role="status"]');

    expect(spoilerButton?.getAttribute('aria-describedby')).toBeTruthy();
    expect(spoilerButton?.textContent).toBe('Spoiler');
    expect(spoilerStatus?.textContent).toContain('Hidden content');
  });

  it('Under a link with a preview title, MarkdownRenderer must render a title link card', async () => {
    const document = await renderServerDocument(
      '[OpenAI](https://github.com/openai/openai "preview")',
    );
    const embedCard = document.querySelector('[data-link-embed-card="true"]');

    expect(embedCard).toBeTruthy();
    expect(embedCard?.textContent).toContain('Loading link information...');
  });

  it('Under a link with a card title, MarkdownRenderer must render the OG card area', async () => {
    const document = await renderServerDocument('[OpenAI](https://openai.com/ "card")');

    expect(document.querySelector('[data-link-embed-card="true"]')).toBeTruthy();
  });

  it('Under an embed keyword link, MarkdownRenderer must render the link embed card area', async () => {
    const document = await renderServerDocument('[embed](https://github.com/openai/openai)');

    expect(document.querySelector('[data-link-embed-card="true"]')).toBeTruthy();
  });

  it('Under a regular external link, MarkdownRenderer must render only the plain link without a card', async () => {
    const document = await renderServerDocument('[OpenAI](https://openai.com/)');

    expect(document.querySelector('[data-link-embed-card="true"]')).toBeNull();
    expect(document.querySelector('a')?.getAttribute('href')).toBe('https://openai.com/');
  });

  it('Under custom syntax, MarkdownRenderer must render each transformed segment as the expected preview element', async () => {
    const markdown = [
      '<span style="color:#3B82F6">Blue text</span>',
      '',
      '<span style="background-color:#EAB308">Background highlight</span>',
      '',
      '<span style="color:#3B82F6; background-color:#EAB308">Mixed highlight</span>',
      '',
      '||Spoiler||',
      '',
      '-# Subtext',
      '',
      '<Video provider="youtube" id="dQw4w9WgXcQ" />',
      '',
      ':::toggle ## Toggle Title',
      'Toggle Content',
      ':::',
      '',
      ':::toggle Default toggle',
      'List Content',
      ':::',
      '',
      ':::align right',
      'Align Content',
      ':::',
    ].join('\n');
    const html = await renderServerHtml(markdown);
    const document = await renderServerDocument(markdown);
    const spoiler = Array.from(document.querySelectorAll('button[aria-expanded]')).find(node =>
      node.textContent?.includes('Spoiler'),
    );
    const subtext = Array.from(document.querySelectorAll('p')).find(node =>
      node.textContent?.includes('Subtext'),
    );
    const iframe = document.querySelector('iframe');
    const details = document.querySelector('details');
    const headingToggleChevron = details?.querySelector('svg[data-toggle-chevron="true"]');
    const toggleListDetails = Array.from(document.querySelectorAll('details')).find(node =>
      node.textContent?.includes('Default toggle'),
    );
    const toggleChevron = toggleListDetails?.querySelector('svg[data-toggle-chevron="true"]');
    const textOnlyColor = Array.from(document.querySelectorAll('span[style]')).find(node =>
      node.textContent?.includes('Blue text'),
    );
    const backgroundOnlyColor = Array.from(document.querySelectorAll('span[style]')).find(node =>
      node.textContent?.includes('Background highlight'),
    ) as HTMLSpanElement | undefined;
    const mixedColor = Array.from(document.querySelectorAll('span[style]')).find(node =>
      node.textContent?.includes('Mixed highlight'),
    );

    expect(html).toContain('Blue text');
    expect(html).toContain('Background highlight');
    expect(html).toContain('Mixed highlight');
    expect(html).toContain('text-align:right');
    expect(textOnlyColor?.getAttribute('style')).toContain('color');
    expect(textOnlyColor?.getAttribute('style')).not.toContain('background-color');
    expect(backgroundOnlyColor?.getAttribute('style')).toContain('background-color');
    expect(backgroundOnlyColor?.style.color).toBe('');
    expect(mixedColor?.getAttribute('style')).toContain('background-color');
    expect(mixedColor?.getAttribute('style')).toContain('color');
    expect(spoiler).toBeTruthy();
    expect(subtext?.textContent).toContain('Subtext');
    expect(iframe?.getAttribute('src')).toContain('dQw4w9WgXcQ');
    expect(details?.textContent).toContain('Toggle Title');
    expect(details?.textContent).toContain('Toggle Content');
    expect(headingToggleChevron).toBeTruthy();
    expect(toggleListDetails?.textContent).toContain('Default toggle');
    expect(toggleListDetails?.textContent).toContain('List Content');
    expect(toggleChevron).toBeTruthy();
  });

  it('Under legacy YouTube custom syntax, MarkdownRenderer must preserve video iframe rendering', async () => {
    const markdown = '<YouTube id="dQw4w9WgXcQ" />';
    const document = await renderServerDocument(markdown);
    const iframe = document.querySelector('iframe');

    expect(iframe?.getAttribute('src')).toContain('dQw4w9WgXcQ');
  });

  it('Under Video syntax with a provider and id, MarkdownRenderer must convert it into iframe rendering', async () => {
    const markdown = '<Video provider="youtube" id="dQw4w9WgXcQ" />';
    const document = await renderServerDocument(markdown);
    const iframe = document.querySelector('iframe');

    expect(iframe?.getAttribute('src')).toContain('dQw4w9WgXcQ');
  });

  it('Under a task list, MarkdownRenderer must preserve the checkbox and task-list-item class', async () => {
    const document = await renderServerDocument(
      ['- [ ] First task', '- [x] Second task'].join('\n'),
    );
    const taskItems = Array.from(document.querySelectorAll('li.task-list-item'));
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));

    expect(taskItems).toHaveLength(2);
    expect(checkboxes).toHaveLength(2);
  });

  it('Under a toggle with an empty title, MarkdownRenderer must render a safe fallback title', async () => {
    const document = await renderServerDocument([':::toggle ### ', 'Content', ':::'].join('\n'));
    const summaryLabel = document.querySelector('summary span');

    expect(summaryLabel?.textContent).toContain('Untitled toggle');
  });
});
