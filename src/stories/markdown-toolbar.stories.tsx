import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import { MarkdownToolbar } from '@/react';
import { Textarea } from '@/shared/ui/textarea/textarea';
import {
  codeBlockClass,
  createStorybookAdapters,
  pageClass,
  panelClass,
  sectionTitleClass,
  splitLayoutClass,
  valuePanelClass,
} from '@/stories/storybook-fixtures';

type ToolbarReferenceProps = {
  contentType: EditorContentType;
  customLabels?: boolean;
  initialValue: string;
};

const ToolbarReference = ({
  contentType,
  customLabels = false,
  initialValue,
}: ToolbarReferenceProps) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = React.useState(initialValue);
  const adapters = React.useMemo(() => createStorybookAdapters(), []);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <main className={pageClass}>
      <section className={panelClass}>
        <div className={splitLayoutClass}>
          <div className={panelClass}>
            <MarkdownToolbar
              adapters={adapters}
              contentType={contentType}
              onChange={setValue}
              textareaRef={textareaRef}
              uiRegistry={
                customLabels
                  ? {
                      labels: {
                        headingPopover: {
                          panelLabel: 'Choose a heading level',
                          triggerAriaLabel: 'Headings',
                          triggerTooltip: 'Headings',
                        },
                        linkEmbedPopover: {
                          panelLabel: 'Link options',
                          triggerAriaLabel: 'Links',
                          triggerTooltip: 'Links',
                        },
                      },
                    }
                  : undefined
              }
            />
            <Textarea
              aria-label="Toolbar story input"
              autoResize={false}
              onChange={event => setValue(event.target.value)}
              placeholder="Use the toolbar to insert markdown"
              ref={textareaRef}
              rows={16}
              value={value}
            />
          </div>

          <aside className={valuePanelClass}>
            <h3 className={sectionTitleClass}>Current value</h3>
            <pre className={codeBlockClass}>{value || 'No markdown inserted yet.'}</pre>
          </aside>
        </div>
      </section>
    </main>
  );
};

const meta = {
  argTypes: {
    contentType: {
      control: 'inline-radio',
      options: ['article', 'project', 'resume'],
    },
    initialValue: {
      control: 'text',
    },
  },
  args: {
    contentType: 'article',
    customLabels: false,
    initialValue: '',
  },
  component: ToolbarReference,
  parameters: {
    docs: {
      description: {
        component:
          'Standalone formatting toolbar reference with a host-controlled textarea and optional custom labels.',
      },
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  title: 'Reference/MarkdownToolbar',
} satisfies Meta<typeof ToolbarReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomLabels: Story = {
  args: {
    contentType: 'article',
    customLabels: true,
    initialValue: '',
  },
};
