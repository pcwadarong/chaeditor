import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import { MarkdownToolbar } from '@/react';
import { Textarea } from '@/shared/ui/textarea/textarea';
import {
  codeBlockClass,
  createStorybookAdapters,
  pageClass,
  panelClass,
  sectionDescriptionClass,
  sectionTitleClass,
  splitLayoutClass,
  valuePanelClass,
} from '@/stories/storybook-fixtures';

type ToolbarReferenceProps = {
  customLabels?: boolean;
};

const ToolbarReference = ({ customLabels = false }: ToolbarReferenceProps) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = React.useState('');
  const adapters = React.useMemo(() => createStorybookAdapters(), []);

  return (
    <main className={pageClass}>
      <section className={panelClass}>
        <div>
          <h2 className={sectionTitleClass}>MarkdownToolbar</h2>
          <p className={sectionDescriptionClass}>
            The toolbar can operate as a standalone editing control. Use the textarea below to see
            how inserts and wrappers are applied to a host-controlled value.
          </p>
        </div>

        <div className={splitLayoutClass}>
          <div className={panelClass}>
            <MarkdownToolbar
              adapters={adapters}
              contentType="article"
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
  component: ToolbarReference,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Reference/MarkdownToolbar',
} satisfies Meta<typeof ToolbarReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomLabels: Story = {
  args: {
    customLabels: true,
  },
};
