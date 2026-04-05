import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { css } from 'styled-system/css';

import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import { MarkdownToolbar } from '@/react';
import { Textarea } from '@/shared/ui/textarea/textarea';
import {
  createStorybookAdapterSet,
  customAdapterUsageSnippet,
  pageClass,
  panelClass,
  type StorybookAdapterMode,
  StorybookCheckList,
  StorybookMetaTable,
  StorybookSectionCard,
  StorybookStatusBadge,
  toolbarPackageUsageSnippet,
} from '@/stories/storybook-fixtures';

type ToolbarReferenceProps = {
  adapterMode: StorybookAdapterMode;
  contentType: EditorContentType;
  customLabels?: boolean;
  initialValue: string;
};

type ToolbarStateSummary = {
  description: string;
  items: Array<{ label: string; value: string }>;
  title: string;
};

const getToolbarStateSummary = (
  adapterMode: StorybookAdapterMode,
  customLabels: boolean,
): ToolbarStateSummary => {
  if (adapterMode === 'none') {
    return {
      description:
        'Only the package-owned toolbar shell is active. Helper entrypoints still render, but host-backed actions are intentionally unavailable.',
      items: [
        { label: 'Mode', value: 'Host adapters off' },
        { label: 'Labels', value: 'Package-default labels' },
        { label: 'Uploads', value: 'Disabled' },
        { label: 'Previews', value: 'Package fallback only' },
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
          label: 'Uploads',
          value: adapterMode === 'custom' ? 'Custom host adapters' : 'Default mock adapters',
        },
        {
          label: 'Previews',
          value: adapterMode === 'custom' ? 'Custom host metadata' : 'Mock host metadata',
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
      { label: 'Uploads', value: 'Default mock adapters' },
      { label: 'Previews', value: 'Mock host metadata' },
    ],
    title: 'Default integrated toolbar',
  };
};

const ToolbarReference = ({
  adapterMode,
  contentType,
  customLabels = false,
  initialValue,
}: ToolbarReferenceProps) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = React.useState(initialValue);
  const adapters = React.useMemo(() => createStorybookAdapterSet(adapterMode), [adapterMode]);
  const summary = React.useMemo(
    () => getToolbarStateSummary(adapterMode, customLabels),
    [adapterMode, customLabels],
  );

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <main className={pageClass}>
      <StorybookSectionCard description={summary.description} title={summary.title}>
        <StorybookMetaTable items={summary.items} />
      </StorybookSectionCard>
      <section className={panelClass}>
        <StorybookSectionCard
          description="Use the toolbar and textarea together to inspect visible label changes, helper availability, and the unchanged markdown insertion contract."
          title="Interactive toolbar surface"
        >
          <StorybookStatusBadge>
            {adapterMode === 'none'
              ? 'Package-only helper surface'
              : 'Live helper insertion surface'}
          </StorybookStatusBadge>
        </StorybookSectionCard>
        <div className={toolbarSurfaceClass}>
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
            rows={14}
            value={value}
          />
        </div>

        <StorybookSectionCard
          description="These rows call out what visibly changes between the baseline, label-only, and host-backed variants."
          title="Visible differences"
        >
          <section className={specimenGridClass}>
            <article className={specimenCardClass}>
              <p className={specimenLabelClass}>Visible copy changes</p>
              <div className={specimenStackClass}>
                <div className={specimenRowClass}>
                  <span className={specimenKeyClass}>Heading helper</span>
                  <span className={specimenValueClass}>
                    {customLabels
                      ? 'Headings / Choose a heading level'
                      : 'Heading tools / Pick a heading token'}
                  </span>
                </div>
                <div className={specimenRowClass}>
                  <span className={specimenKeyClass}>Link helper</span>
                  <span className={specimenValueClass}>
                    {customLabels ? 'Links / Link options' : 'Link helper / Link insertion'}
                  </span>
                </div>
              </div>
              <p className={specimenBodyClass}>
                {customLabels
                  ? 'Only the helper wording changes in this variant.'
                  : 'This variant keeps the package-default helper wording.'}
              </p>
            </article>

            <article className={specimenCardClass}>
              <p className={specimenLabelClass}>Host-backed behavior</p>
              <div className={statusRowClass}>
                <span
                  className={
                    adapterMode === 'none' ? statusChipMutedClass : statusChipPositiveClass
                  }
                >
                  {adapterMode === 'none'
                    ? 'Uploads off'
                    : adapterMode === 'custom'
                      ? 'Custom uploads'
                      : 'Mock uploads'}
                </span>
                <span
                  className={
                    adapterMode === 'none' ? statusChipMutedClass : statusChipPositiveClass
                  }
                >
                  {adapterMode === 'none'
                    ? 'Plain link behavior'
                    : adapterMode === 'custom'
                      ? 'Custom metadata'
                      : 'Mock metadata'}
                </span>
              </div>
              <p className={specimenBodyClass}>
                {adapterMode === 'none'
                  ? 'Helper entrypoints still render, but no host upload or preview adapter runs behind them.'
                  : adapterMode === 'custom'
                    ? 'The same toolbar contracts now resolve through a branded host integration.'
                    : 'The toolbar uses the default local Storybook adapters so helper flows behave like a connected product shell.'}
              </p>
            </article>
          </section>
        </StorybookSectionCard>

        <StorybookSectionCard
          description="These guarantees stay intact even when labels or host adapters change."
          title="What stays the same"
        >
          <StorybookCheckList
            items={[
              'Same toolbar layout and action order',
              'Same markdown insertion contract',
              'Same textarea editing surface',
            ]}
          />
        </StorybookSectionCard>
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
  },
  args: {
    adapterMode: 'full',
    contentType: 'article',
    customLabels: false,
    initialValue: '',
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

const toolbarSurfaceClass = css({
  display: 'grid',
  gap: '4',
});

const specimenGridClass = css({
  display: 'grid',
  gap: '4',
  gridTemplateColumns: {
    base: '1fr',
    xl: 'repeat(3, minmax(0, 1fr))',
  },
});

const specimenCardClass = css({
  display: 'grid',
  gap: '3',
  alignContent: 'start',
  paddingTop: '2',
});

const specimenLabelClass = css({
  color: 'primary',
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
});

const specimenBodyClass = css({
  color: 'textSubtle',
  fontSize: 'sm',
  lineHeight: 'relaxed',
});

const specimenStackClass = css({
  display: 'grid',
  gap: '2',
});

const specimenRowClass = css({
  display: 'grid',
  gap: '1',
});

const specimenKeyClass = css({
  color: 'textSubtle',
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
});

const specimenValueClass = css({
  color: 'text',
  fontSize: 'sm',
  lineHeight: 'relaxed',
  fontWeight: 'medium',
});

const statusRowClass = css({
  display: 'flex',
  gap: '2',
  flexWrap: 'wrap',
});

const statusChipBaseClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '8',
  borderRadius: 'full',
  px: '3',
  fontSize: 'xs',
  fontWeight: 'semibold',
});

const statusChipPositiveClass = `${statusChipBaseClass} ${css({
  backgroundColor: 'primarySubtle',
  color: 'primary',
})}`;

const statusChipMutedClass = `${statusChipBaseClass} ${css({
  backgroundColor: 'surfaceStrong',
  color: 'textSubtle',
})}`;
