import type { Options } from 'react-markdown';
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from 'rehype-pretty-code';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import {
  createMarkdownComponents,
  type MarkdownViewerConfig,
} from '@/shared/lib/markdown/markdown-components';

type MarkdownOptions = Pick<Options, 'components' | 'rehypePlugins' | 'remarkPlugins'>;

/**
 * Code highlighting options passed to `rehype-pretty-code`.
 */
const prettyCodeOptions: RehypePrettyCodeOptions = {
  defaultLang: 'plaintext',
  keepBackground: false,
  theme: 'github-dark',
};

/**
 * Creates shared markdown rendering options for server and client rendering.
 */
export const getMarkdownOptions = ({
  adapters,
  items,
}: MarkdownViewerConfig = {}): MarkdownOptions => ({
  components: createMarkdownComponents({ adapters, items }),
  rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
  remarkPlugins: [remarkGfm, remarkBreaks],
});
