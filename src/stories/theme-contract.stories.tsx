import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { CSSProperties } from 'react';
import { css, cx } from 'styled-system/css';

import { themeOverrideUsageSnippet } from '@/stories/support/storybook-code-snippets';
import {
  StorybookDocsHero,
  storybookDocsPageClass,
  storybookDocsSectionClass,
} from '@/stories/support/storybook-docs';

const themeContractHostThemeVars = {
  '--colors-border': '#edd9a3',
  '--colors-border-strong': '#ca8a04',
  '--colors-primary': '#a16207',
  '--colors-primary-contrast': '#fffbeb',
  '--colors-primary-muted': '#fde68a',
  '--colors-primary-subtle': '#fef3c7',
  '--colors-surface': '#fffbeb',
  '--colors-surface-muted': '#fef3c7',
  '--colors-surface-strong': '#fcd34d',
  '--colors-text': '#422006',
  '--colors-text-subtle': '#854d0e',
  '--fonts-sans': 'Georgia, "Times New Roman", serif',
  '--chaeditor-color-border': '#edd9a3',
  '--chaeditor-color-border-strong': '#ca8a04',
  '--chaeditor-color-primary': '#a16207',
  '--chaeditor-color-primary-contrast': '#fffbeb',
  '--chaeditor-color-primary-muted': '#fde68a',
  '--chaeditor-color-primary-subtle': '#fef3c7',
  '--chaeditor-color-surface': '#fffbeb',
  '--chaeditor-color-surface-muted': '#fef3c7',
  '--chaeditor-color-surface-strong': '#fcd34d',
  '--chaeditor-color-text': '#422006',
  '--chaeditor-color-text-subtle': '#854d0e',
  '--chaeditor-font-sans': 'Georgia, "Times New Roman", serif',
  '--chaeditor-font-mono': '"Courier New", "Liberation Mono", monospace',
} as CSSProperties;

const ThemeTokenCard = ({
  description,
  eyebrow,
  isOverride = false,
  title,
}: {
  description: string;
  eyebrow: string;
  isOverride?: boolean;
  title: string;
}) => (
  <article
    className={isOverride ? cx(themeCardClass, overrideThemeCardClass) : themeCardClass}
    style={isOverride ? themeContractHostThemeVars : undefined}
  >
    <div className={themeCardHeaderClass}>
      <p
        className={
          isOverride
            ? cx(mutedTokenEyebrowClass, overrideTokenEyebrowClass)
            : mutedTokenEyebrowClass
        }
      >
        {eyebrow}
      </p>
      <h2 className={themeCardTitleClass}>{title}</h2>
      <p className={cardBodyClass}>{description}</p>
    </div>
    <div className={themeSpecimenClass}>
      <div className={themeSpecimenPanelClass}>
        <div className={themeSpecimenHeaderClass}>
          <div>
            <p className={themeSpecimenEyebrowClass}>Markdown editor shell</p>
            <h3 className={themeSpecimenTitleClass}>Composable authoring surface</h3>
          </div>
          <button className={themeSpecimenPrimaryButtonClass} type="button">
            Publish
          </button>
        </div>
        <p className={themeSpecimenBodyClass}>
          Toolbar actions, preview panes, and helper overlays inherit the same scoped theme values.
        </p>
        <div className={themeSpecimenInputClass}>https://www.npmjs.com/package/chaeditor</div>
        <div className={themeSpecimenFooterClass}>
          <span className={themeSpecimenMutedChipClass}>Surface</span>
          <code className={themeSpecimenCodeClass}>GET /articles/[slug]</code>
        </div>
      </div>
    </div>
  </article>
);

const ThemeContractPage = () => (
  <main className={storybookDocsPageClass}>
    <StorybookDocsHero
      description={
        <>
          chaeditor ships with a complete default theme. Every semantic color and font token is
          exposed as a CSS variable so the host app can override only what needs to change. Import{' '}
          <code className={inlineCodeClass}>chaeditor/styles.css</code> to get the fallback tokens,
          then scope your overrides to a wrapper element so they never leak outside the editor
          boundary.
        </>
      }
      title="Brand colors and typography without rebuilding the component"
    />

    <section className={storybookDocsSectionClass}>
      <div className={themeGridClass}>
        <ThemeTokenCard
          description="No wrapper overrides are applied. This is the package theme as shipped."
          eyebrow="Default package theme"
          title="Fallback tokens only"
        />
        <ThemeTokenCard
          description="The host injects brand colors and typography while keeping the same component contracts."
          eyebrow="Scoped host override"
          isOverride
          title="Brand tokens via CSS variables"
        />
      </div>
    </section>
  </main>
);

const meta = {
  component: ThemeContractPage,
  parameters: {
    docs: {
      description: {
        component:
          'Theme contract reference for the package. Use this page when you need to decide whether the default package theme is enough or the host should inject scoped CSS variables.',
      },
      source: {
        code: themeOverrideUsageSnippet,
      },
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs', '!dev'],
  title: 'Introduction/Theme Contract',
} satisfies Meta<typeof ThemeContractPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
Default.parameters = {
  docs: {
    description: {
      story:
        'Use this page when you need to decide whether the package default theme is enough or the host app should inject scoped CSS variables for brand colors and typography.',
    },
  },
};

const cardBodyClass = css({
  color: 'textSubtle',
  lineHeight: 'relaxed',
});

const themeGridClass = css({
  display: 'grid',
  gap: '5',
  gridTemplateColumns: { base: '1fr', xl: 'repeat(2, minmax(0, 1fr))' },
});

const themeCardClass = css({
  bg: 'surface',
  border: '[1px solid var(--colors-border)]',
  borderRadius: '2xl',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const overrideThemeCardClass = css({
  borderColor: 'primary',
  boxShadow: '[0_0_0_1px_var(--colors-primary-subtle)]',
});

const themeCardHeaderClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  p: '7',
});

const mutedTokenEyebrowClass = css({
  color: 'textSubtle',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
});

const overrideTokenEyebrowClass = css({
  color: 'primary',
});

const themeCardTitleClass = css({
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: '2xl',
  fontWeight: 'semibold',
  lineHeight: 'tight',
});

const themeSpecimenClass = css({
  bg: 'surfaceMuted',
  borderBlockStart: '[1px solid var(--colors-border)]',
  px: '7',
  py: '6',
});

const themeSpecimenPanelClass = css({
  backgroundColor: `[var(--chaeditor-color-surface,${'#ffffff'})]`,
  border: `[1px solid var(--chaeditor-color-border,${'#d4d4d8'})]`,
  borderRadius: 'xl',
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
  p: '5',
});

const themeSpecimenHeaderClass = css({
  alignItems: 'start',
  display: 'flex',
  gap: '4',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
});

const themeSpecimenEyebrowClass = css({
  color: `[var(--chaeditor-color-text-subtle,${'#52525b'})]`,
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
});

const themeSpecimenTitleClass = css({
  color: `[var(--chaeditor-color-text,${'#18181b'})]`,
  fontFamily: `[var(--chaeditor-font-sans,${"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"})]`,
  fontSize: '2xl',
  fontWeight: 'bold',
  lineHeight: 'tight',
});

const themeSpecimenBodyClass = css({
  color: `[var(--chaeditor-color-text-subtle,${'#52525b'})]`,
  fontFamily: `[var(--chaeditor-font-sans,${"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"})]`,
  fontSize: 'sm',
  lineHeight: 'relaxed',
  maxWidth: 'lg',
});

const themeSpecimenInputClass = css({
  backgroundColor: `[var(--chaeditor-color-surface-muted,${'#f4f4f5'})]`,
  border: `[1px solid var(--chaeditor-color-border,${'#d4d4d8'})]`,
  borderRadius: 'lg',
  color: `[var(--chaeditor-color-text,${'#18181b'})]`,
  fontFamily: `[var(--chaeditor-font-mono,${"var(--font-d2coding), 'D2Coding', 'SFMono-Regular', 'JetBrains Mono', Consolas, 'Liberation Mono', monospace"})]`,
  fontSize: 'sm',
  px: '3',
  py: '3',
});

const themeSpecimenFooterClass = css({
  alignItems: 'center',
  display: 'flex',
  gap: '3',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
});

const themeSpecimenMutedChipClass = css({
  alignItems: 'center',
  backgroundColor: `[var(--chaeditor-color-surface-strong,${'#e4e4e7'})]`,
  borderRadius: 'full',
  color: `[var(--chaeditor-color-text,${'#18181b'})]`,
  display: 'inline-flex',
  fontFamily: `[var(--chaeditor-font-sans,${"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"})]`,
  fontSize: 'xs',
  fontWeight: 'semibold',
  minHeight: '8',
  px: '3',
});

const themeSpecimenPrimaryButtonClass = css({
  alignItems: 'center',
  backgroundColor: `[var(--chaeditor-color-primary,${'#3b82f6'})]`,
  borderRadius: 'full',
  color: `[var(--chaeditor-color-primary-contrast,${'#ffffff'})]`,
  display: 'inline-flex',
  fontFamily: `[var(--chaeditor-font-sans,${"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"})]`,
  fontSize: 'sm',
  fontWeight: 'semibold',
  justifyContent: 'center',
  minHeight: '10',
  px: '4',
});

const inlineCodeClass = css({
  bg: 'surfaceMuted',
  borderRadius: 'md',
  color: 'text',
  fontFamily: 'mono',
  fontSize: 'sm',
  px: '1.5',
  py: '0.5',
});

const themeSpecimenCodeClass = css({
  backgroundColor: `[var(--chaeditor-color-surface-muted,${'#f4f4f5'})]`,
  borderRadius: 'md',
  color: `[var(--chaeditor-color-text-subtle,${'#52525b'})]`,
  fontFamily: `[var(--chaeditor-font-mono,${"var(--font-d2coding), 'D2Coding', 'SFMono-Regular', 'JetBrains Mono', Consolas, 'Liberation Mono', monospace"})]`,
  fontSize: 'xs',
  px: '2.5',
  py: '1.5',
});
