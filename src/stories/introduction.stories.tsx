import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { css } from 'styled-system/css';

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
            Build compact or feature-rich authoring experiences with presets, registries, and
            embeddable interaction units.
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

const meta = {
  component: IntroPage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Introduction/Overview',
} satisfies Meta<typeof IntroPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};

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
