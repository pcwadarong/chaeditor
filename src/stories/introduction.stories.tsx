import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { CSSProperties } from 'react';
import { css } from 'styled-system/css';

import {
  StorybookCompactSummary,
  storybookHostThemeVars,
  themeOverrideUsageSnippet,
} from '@/stories/storybook-fixtures';

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

const ThemeContractPage = () => (
  <main className={pageClass}>
    <div className={heroClass}>
      <p className={eyebrowClass}>theming</p>
      <h1 className={titleClass}>Host theme overrides stay scoped and optional</h1>
      <p className={descriptionClass}>
        chaeditor ships with a default theme, but every semantic color and font token can be
        overridden through CSS variables. Regular UI fonts should come from the host app, while the
        mono slot can optionally use D2Coding through the package fallback chain.
      </p>
    </div>

    <section className={sectionClass}>
      <StorybookCompactSummary
        description="Use the default theme when you want the package look out of the box. Use a scoped host override when the editor needs to inherit brand colors or product typography without changing its logic contract."
        items={[
          { label: 'Default', value: 'Package fallback tokens and system sans fonts' },
          { label: 'Override', value: 'Scoped host CSS variables for colors and fonts' },
          { label: 'Mono', value: 'Optional D2Coding fallback for code-heavy UI' },
        ]}
        title="Theme contract"
      />

      <div className={themeGridClass}>
        <article className={cardClass}>
          <p className={tokenEyebrowClass}>Default package theme</p>
          <h2 className={cardTitleClass}>Fallback tokens only</h2>
          <p className={cardBodyClass}>
            No wrapper overrides are applied here. This is what consumers get after importing
            <code className={inlineCodeClass}> chaeditor/styles.css </code>
            and mounting the editor surface as-is.
          </p>
          <div className={swatchGridClass}>
            <div className={swatchClass}>
              <span className={surfaceSwatchClass} />
              <div className={swatchTextClass}>
                <strong>Surface</strong>
                <span>Package default canvas</span>
              </div>
            </div>
            <div className={swatchClass}>
              <span className={primarySwatchClass} />
              <div className={swatchTextClass}>
                <strong>Primary</strong>
                <span>Package action color</span>
              </div>
            </div>
            <div className={swatchClass}>
              <span className={textSwatchClass} />
              <div className={swatchTextClass}>
                <strong>Typography</strong>
                <span>System sans + package mono fallback</span>
              </div>
            </div>
          </div>
        </article>

        <article className={cardClass} style={storybookHostThemeVars as CSSProperties}>
          <p className={tokenEyebrowClass}>Scoped host override</p>
          <h2 className={cardTitleClass}>Brand tokens through CSS variables</h2>
          <p className={cardBodyClass}>
            The host can set only the values it cares about. In this example, the primary palette,
            surfaces, and sans font are overridden while the component contracts stay unchanged.
          </p>
          <div className={swatchGridClass}>
            <div className={swatchClass}>
              <span className={surfaceSwatchClass} />
              <div className={swatchTextClass}>
                <strong>Surface</strong>
                <span>Host-owned product background</span>
              </div>
            </div>
            <div className={swatchClass}>
              <span className={primarySwatchClass} />
              <div className={swatchTextClass}>
                <strong>Primary</strong>
                <span>Brand action color</span>
              </div>
            </div>
            <div className={swatchClass}>
              <span className={textSwatchClass} />
              <div className={swatchTextClass}>
                <strong>Typography</strong>
                <span>Host sans font + optional mono fallback</span>
              </div>
            </div>
          </div>
        </article>
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

const tokenEyebrowClass = css({
  color: 'primary',
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
});

const swatchGridClass = css({
  display: 'grid',
  gap: '3',
  marginTop: '2',
});

const swatchClass = css({
  alignItems: 'center',
  display: 'grid',
  gap: '3',
  gridTemplateColumns: '[2.75rem_1fr]',
});

const swatchTextClass = css({
  display: 'grid',
  gap: '1',
  lineHeight: 'relaxed',
  '& span': {
    color: 'textSubtle',
    fontSize: 'sm',
  },
});

const swatchDotStyles = {
  border: '[1px solid var(--colors-border)]',
  borderRadius: 'xl',
  boxShadow: 'sm',
  display: 'block',
  height: '11',
  width: '11',
} as const;

const surfaceSwatchClass = css({
  ...swatchDotStyles,
  bg: 'surfaceMuted',
});

const primarySwatchClass = css({
  ...swatchDotStyles,
  bg: 'primary',
  borderColor: 'primary',
});

const textSwatchClass = css({
  ...swatchDotStyles,
  bg: 'surface',
  position: 'relative',
  _after: {
    content: '"Aa"',
    color: 'text',
    fontFamily: 'sans',
    fontSize: 'sm',
    fontWeight: 'bold',
    inset: '0',
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
