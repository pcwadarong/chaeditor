import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { CSSProperties } from 'react';
import { css, cx } from 'styled-system/css';

import { themeOverrideUsageSnippet } from '@/stories/storybook-fixtures';

const IntroPage = () => (
  <main className={pageClass}>
    <div className={heroClass}>
      <p className={eyebrowClass}>chaeditor</p>
      <h1 className={titleClass}>Composable markdown editing for modern React apps</h1>
      <p className={descriptionClass}>
        chaeditor combines authoring helpers, media embed flows, and markdown rendering into a
        single toolkit. It is designed for teams that want a flexible editor surface without locking
        themselves into one styling system or app framework.
      </p>
    </div>

    <section className={sectionClass}>
      <h2 className={sectionTitleClass}>What you can build</h2>
      <div className={cardGridClass}>
        <article className={cardClass}>
          <h3 className={cardTitleClass}>Composable toolbar</h3>
          <p className={cardBodyClass}>
            Build compact or rich authoring experiences with presets, registries, and embeddable
            interaction units.
          </p>
        </article>
        <article className={cardClass}>
          <h3 className={cardTitleClass}>Rich markdown rendering</h3>
          <p className={cardBodyClass}>
            Render attachments, galleries, math, Mermaid diagrams, spoilers, videos, and
            host-provided link preview cards from a single markdown pipeline.
          </p>
        </article>
        <article className={cardClass}>
          <h3 className={cardTitleClass}>Host adapters</h3>
          <p className={cardBodyClass}>
            Keep upload handlers, href resolution, and preview metadata outside the package so your
            product can decide how the editor talks to storage and APIs.
          </p>
        </article>
      </div>
    </section>
  </main>
);

const themeContractHostThemeVars = {
  '--colors-border': '#eab39b',
  '--colors-border-strong': '#d97706',
  '--colors-primary': '#b45309',
  '--colors-primary-contrast': '#fff7ed',
  '--colors-primary-muted': '#fed7aa',
  '--colors-primary-subtle': '#ffedd5',
  '--colors-surface': '#fff7ed',
  '--colors-surface-muted': '#ffedd5',
  '--colors-surface-strong': '#fdba74',
  '--colors-text': '#3b1906',
  '--colors-text-subtle': '#7c2d12',
  '--fonts-sans': 'Georgia, "Times New Roman", serif',
  '--chaeditor-color-border': '#f3c6b3',
  '--chaeditor-color-border-strong': '#e59b7a',
  '--chaeditor-color-primary': '#b45309',
  '--chaeditor-color-primary-contrast': '#fff7ed',
  '--chaeditor-color-primary-muted': '#fed7aa',
  '--chaeditor-color-primary-subtle': '#ffedd5',
  '--chaeditor-color-surface': '#fff7ed',
  '--chaeditor-color-surface-muted': '#ffedd5',
  '--chaeditor-color-surface-strong': '#fdba74',
  '--chaeditor-color-text': '#3b1906',
  '--chaeditor-color-text-subtle': '#7c2d12',
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
        <div className={themeSpecimenInputClass}>https://chaeditor.dev/docs/getting-started</div>
        <div className={themeSpecimenFooterClass}>
          <span className={themeSpecimenMutedChipClass}>Surface</span>
          <code className={themeSpecimenCodeClass}>GET /articles/[slug]</code>
        </div>
      </div>
    </div>
  </article>
);

const ThemeContractPage = () => (
  <main className={pageClass}>
    <div className={heroClass}>
      <p className={eyebrowClass}>theming system</p>
      <h1 className={titleClass}>Host theme overrides stay scoped and optional</h1>
      <p className={descriptionClass}>
        chaeditor ships with a default theme, but every semantic color and font token can be
        overridden through CSS variables. Import
        <code className={inlineCodeClass}> chaeditor/styles.css </code>
        to get fallback tokens, then override only what you need.
      </p>
    </div>

    <section className={sectionClass}>
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
  component: IntroPage,
  parameters: {
    docs: {
      description: {
        component:
          'Overview of the package goals, composable editor surface, and host-adapter-first integration model.',
      },
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  title: 'Introduction/Overview',
} satisfies Meta<typeof IntroPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
Overview.parameters = {
  docs: {
    description: {
      story:
        'Use this page as the first-stop overview of the package surface. It explains what the editor toolkit is for before you move into the more specific reference stories.',
    },
  },
};

export const ThemeContract: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use this page when you need to decide whether the package default theme is enough or the host app should inject scoped CSS variables for brand colors and typography.',
      },
      source: {
        code: themeOverrideUsageSnippet,
      },
    },
  },
  render: () => <ThemeContractPage />,
};

const pageClass = css({
  bg: 'surface',
  color: 'text',
  minHeight: 'dvh',
  px: { base: '6', md: '10' },
  py: { base: '10', md: '16' },
});

const heroClass = css({
  display: 'grid',
  gap: '5',
  marginInline: 'auto',
  maxWidth: '5xl',
});

const eyebrowClass = css({
  color: 'primary',
  fontSize: 'sm',
  fontWeight: 'semibold',
  letterSpacing: 'widest',
  textTransform: 'uppercase',
});

const titleClass = css({
  fontSize: { base: '4xl', md: '6xl' },
  fontWeight: 'bold',
  lineHeight: 'tight',
  maxWidth: '4xl',
});

const descriptionClass = css({
  color: 'textSubtle',
  fontSize: { base: 'lg', md: 'xl' },
  lineHeight: 'loose',
  maxWidth: '3xl',
});

const sectionClass = css({
  display: 'grid',
  gap: '6',
  marginInline: 'auto',
  marginTop: '12',
  maxWidth: '5xl',
});

const sectionTitleClass = css({
  fontSize: '2xl',
  fontWeight: 'semibold',
});

const cardGridClass = css({
  display: 'grid',
  gap: '5',
  gridTemplateColumns: { base: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
});

const cardClass = css({
  bg: 'surfaceMuted',
  border: '[1px solid var(--colors-border)]',
  borderRadius: '2xl',
  display: 'grid',
  gap: '3',
  minHeight: '52',
  p: '6',
  shadow: 'sm',
});

const cardTitleClass = css({
  fontSize: 'xl',
  fontWeight: 'semibold',
});

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
  display: 'grid',
  overflow: 'hidden',
});

const overrideThemeCardClass = css({
  borderColor: 'primary',
  boxShadow: '[0_0_0_1px_var(--colors-primary-subtle)]',
});

const themeCardHeaderClass = css({
  display: 'grid',
  gap: '3',
  p: '7',
});

const mutedTokenEyebrowClass = css({
  color: 'textSubtle',
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
});

const overrideTokenEyebrowClass = css({
  color: 'primary',
});

const themeCardTitleClass = css({
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
  display: 'grid',
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
