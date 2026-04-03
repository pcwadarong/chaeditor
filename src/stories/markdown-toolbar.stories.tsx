import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import { MarkdownToolbar } from '@/react';
import { Textarea } from '@/shared/ui/textarea/textarea';
import {
  codeBlockClass,
  createStorybookAdapterSet,
  customAdapterUsageSnippet,
  getStorybookThemeStyle,
  pageClass,
  panelClass,
  sectionTitleClass,
  splitLayoutClass,
  type StorybookAdapterMode,
  StorybookCompactSummary,
  type StorybookThemeMode,
  themeOverrideUsageSnippet,
  toolbarPackageUsageSnippet,
  valuePanelClass,
} from '@/stories/storybook-fixtures';

type ToolbarReferenceProps = {
  adapterMode: StorybookAdapterMode;
  contentType: EditorContentType;
  customLabels?: boolean;
  initialValue: string;
  themeMode?: StorybookThemeMode;
};

type ToolbarStateSummary = {
  description: string;
  items: Array<{ label: string; value: string }>;
  title: string;
};

const getToolbarStateSummary = (
  adapterMode: StorybookAdapterMode,
  customLabels: boolean,
  themeMode: StorybookThemeMode,
): ToolbarStateSummary => {
  if (adapterMode === 'none') {
    return {
      description:
        'Only the package-owned toolbar shell is active. Helper entrypoints still render, but host-backed actions are intentionally unavailable.',
      items: [
        { label: 'Mode', value: 'Host adapters off' },
        { label: 'Labels', value: 'Package-default labels' },
        {
          label: 'Theme',
          value: themeMode === 'host' ? 'Host theme wrapper applied' : 'Package default theme',
        },
      ],
      title: 'Core-only toolbar shell',
    };
  }

  if (customLabels) {
    return {
      description:
        'The toolbar commands and layout stay unchanged, but selected heading and link copy is overridden so wording changes can be reviewed on their own.',
      items: [
        {
          label: 'Mode',
          value:
            adapterMode === 'custom'
              ? 'Custom host adapters with branded preview behavior'
              : 'Default mock host adapters enabled',
        },
        { label: 'Labels', value: 'Heading and link labels overridden' },
        {
          label: 'Theme',
          value: themeMode === 'host' ? 'Host theme wrapper applied' : 'Package default theme',
        },
      ],
      title:
        adapterMode === 'custom'
          ? 'Custom host integration + custom labels'
          : 'Default host integration + custom labels',
    };
  }

  return {
    description:
      'This is the baseline integrated toolbar reference. It uses the package-default labels and the standard mock host adapters for every helper flow.',
    items: [
      { label: 'Mode', value: 'Default mock host adapters enabled' },
      { label: 'Labels', value: 'Package-default labels' },
      {
        label: 'Theme',
        value: themeMode === 'host' ? 'Host theme wrapper applied' : 'Package default theme',
      },
    ],
    title: 'Default integrated toolbar',
  };
};

const ToolbarStatePanel = ({
  adapterMode,
  customLabels = false,
  themeMode = 'default',
}: Pick<ToolbarReferenceProps, 'adapterMode' | 'customLabels' | 'themeMode'>) => {
  const summary = getToolbarStateSummary(adapterMode, customLabels, themeMode);

  return (
    <StorybookCompactSummary
      description={summary.description}
      items={summary.items}
      title={summary.title}
    />
  );
};

const ToolbarReference = ({
  adapterMode,
  contentType,
  customLabels = false,
  initialValue,
  themeMode = 'default',
}: ToolbarReferenceProps) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = React.useState(initialValue);
  const adapters = React.useMemo(() => createStorybookAdapterSet(adapterMode), [adapterMode]);
  const themeStyle = React.useMemo(() => getStorybookThemeStyle(themeMode), [themeMode]);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <main className={pageClass}>
      <ToolbarStatePanel
        adapterMode={adapterMode}
        customLabels={customLabels}
        themeMode={themeMode}
      />
      <section className={panelClass} style={themeStyle}>
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
    adapterMode: {
      control: 'inline-radio',
      options: ['full', 'custom', 'none'],
    },
    contentType: {
      control: 'inline-radio',
      options: ['article', 'project', 'resume'],
    },
    initialValue: {
      control: 'text',
    },
    themeMode: {
      control: 'inline-radio',
      options: ['default', 'host'],
    },
  },
  args: {
    adapterMode: 'full',
    contentType: 'article',
    customLabels: false,
    initialValue: '',
    themeMode: 'default',
  },
  component: ToolbarReference,
  parameters: {
    docs: {
      description: {
        component:
          'Standalone formatting toolbar reference for the toolbar shell. Compare the variants to see the package baseline, label-only customization, a core-only shell with no host adapters, and a branded host override using the same command surface.',
      },
      source: {
        code: toolbarPackageUsageSnippet,
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
Default.name = 'Default integration';
Default.parameters = {
  docs: {
    description: {
      story:
        'The baseline integrated state. Use this as the comparison point because it keeps both the default package labels and the default Storybook host adapters.',
    },
  },
};

export const CustomLabels: Story = {
  args: {
    adapterMode: 'full',
    contentType: 'article',
    customLabels: true,
    initialValue: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Keeps the same default Storybook host adapters as the baseline story, but overrides selected heading and link copy. Use this variant to review wording-only customization.',
      },
    },
  },
};
CustomLabels.name = 'Custom label overrides';

export const CoreOnly: Story = {
  args: {
    adapterMode: 'none',
    contentType: 'article',
    customLabels: false,
    initialValue: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Disables all host adapters and leaves only the package-owned toolbar shell. Helper entrypoints still render, but upload-backed and metadata-backed behavior is unavailable.',
      },
    },
  },
};
CoreOnly.name = 'Core-only shell';

export const CustomHostIntegration: Story = {
  args: {
    adapterMode: 'custom',
    contentType: 'article',
    customLabels: true,
    initialValue: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Replaces the default Storybook host adapters with branded host behavior and keeps custom labels enabled. Use this to review the most product-specific variant of the same toolbar shell.',
      },
      source: {
        code: customAdapterUsageSnippet,
      },
    },
  },
};
CustomHostIntegration.name = 'Custom host integration';

export const HostThemeOverride: Story = {
  args: {
    adapterMode: 'full',
    contentType: 'article',
    customLabels: false,
    initialValue: '',
    themeMode: 'host',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Applies the same toolbar shell and default Storybook host adapters inside a scoped host theme wrapper. Use this when the question is visual alignment with a product design system rather than command behavior.',
      },
      source: {
        code: themeOverrideUsageSnippet,
      },
    },
  },
};
HostThemeOverride.name = 'Host theme override';
