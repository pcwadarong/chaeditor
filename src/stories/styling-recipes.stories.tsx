import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { css } from 'styled-system/css';

import {
  codeBlockClass,
  emotionThemeUsageSnippet,
  pageClass,
  primitiveRegistryUsageSnippet,
  StorybookCompactSummary,
  StorybookPrimitiveRegistryShowcase,
  styledComponentsThemeUsageSnippet,
  tailwindThemeUsageSnippet,
  vanillaExtractThemeUsageSnippet,
} from '@/stories/storybook-fixtures';

const StylingRecipesPage = () => (
  <main className={pageClass}>
    <section className={sectionClass}>
      <StorybookCompactSummary
        description="Use these recipes when the package theme contract needs to inherit the host product styling system instead of staying on the package defaults."
        items={[
          { label: 'Tailwind', value: 'Scope variables with arbitrary utility classes' },
          { label: 'Emotion', value: 'Wrap the editor with a CSS object or Global style' },
          { label: 'styled-components', value: 'Attach variables through a styled wrapper' },
          { label: 'vanilla-extract', value: 'Generate a typed scope class for editor variables' },
        ]}
        title="Host-side styling recipes"
      />

      <div className={recipeGridClass}>
        <article className={recipeCardClass}>
          <div className={recipeHeaderClass}>
            <p className={recipeEyebrowClass}>Tailwind CSS</p>
            <h2 className={recipeTitleClass}>
              Best when your app already uses utility-first theming
            </h2>
          </div>
          <p className={recipeDescriptionClass}>
            Scope the editor theme with arbitrary property utilities. This works well when brand
            tokens already exist in the host layer and the editor should inherit them without
            introducing another runtime.
          </p>
          <pre className={codeBlockClass}>{tailwindThemeUsageSnippet}</pre>
        </article>

        <article className={recipeCardClass}>
          <div className={recipeHeaderClass}>
            <p className={recipeEyebrowClass}>Emotion</p>
            <h2 className={recipeTitleClass}>
              Best when the host already uses component-scoped CSS objects
            </h2>
          </div>
          <p className={recipeDescriptionClass}>
            Reuse <code className={inlineCodeClass}>createChaeditorThemeVars()</code> directly in an
            Emotion wrapper or Global style. The editor keeps its package logic while the host
            decides where the CSS variables live.
          </p>
          <pre className={codeBlockClass}>{emotionThemeUsageSnippet}</pre>
        </article>

        <article className={recipeCardClass}>
          <div className={recipeHeaderClass}>
            <p className={recipeEyebrowClass}>styled-components</p>
            <h2 className={recipeTitleClass}>
              Best when the host theme is already expressed as wrappers
            </h2>
          </div>
          <p className={recipeDescriptionClass}>
            Use a styled wrapper as the editor scope and feed the semantic CSS variable map into it.
            This keeps theme ownership in the host design system and avoids package-level runtime
            branching.
          </p>
          <pre className={codeBlockClass}>{styledComponentsThemeUsageSnippet}</pre>
        </article>

        <article className={recipeCardClass}>
          <div className={recipeHeaderClass}>
            <p className={recipeEyebrowClass}>vanilla-extract</p>
            <h2 className={recipeTitleClass}>
              Best when your design system already emits typed theme scopes
            </h2>
          </div>
          <p className={recipeDescriptionClass}>
            Use a generated scope class to assign the same editor CSS variables in one place. This
            keeps the package runtime-agnostic while fitting teams that already prefer static CSS
            extraction and typed token authoring.
          </p>
          <pre className={codeBlockClass}>{vanillaExtractThemeUsageSnippet}</pre>
        </article>
      </div>

      <article className={recipeCardClass}>
        <div className={recipeHeaderClass}>
          <p className={recipeEyebrowClass}>Primitive registry</p>
          <h2 className={recipeTitleClass}>
            Best when the host needs to replace actual input and overlay shells
          </h2>
        </div>
        <p className={recipeDescriptionClass}>
          Theme variables change colors and fonts, but a primitive registry lets the host swap the
          actual button, input, textarea, popover, modal, and tooltip shells. Use this when the
          design system needs more than token-level overrides.
        </p>
        <pre className={codeBlockClass}>{primitiveRegistryUsageSnippet}</pre>
        <div className={showcaseClass}>
          <StorybookPrimitiveRegistryShowcase />
        </div>
      </article>
    </section>
  </main>
);

const meta = {
  component: StylingRecipesPage,
  parameters: {
    docs: {
      description: {
        component:
          'Host-side styling recipes for Tailwind CSS, Emotion, styled-components, vanilla-extract, and primitive shell overrides. These examples keep the package on one semantic CSS variable contract while letting the host app choose either token injection or primitive replacement.',
      },
      source: {
        code: tailwindThemeUsageSnippet,
      },
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  title: 'Introduction/Styling Recipes',
} satisfies Meta<typeof StylingRecipesPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
Overview.parameters = {
  docs: {
    description: {
      story:
        'Use this page when the package theme contract is already settled and the remaining question is how to scope those CSS variables inside the host styling runtime.',
    },
  },
};

const sectionClass = css({
  display: 'grid',
  gap: '6',
  marginInline: 'auto',
  maxWidth: '6xl',
});

const recipeGridClass = css({
  display: 'grid',
  gap: '5',
});

const recipeCardClass = css({
  bg: 'surfaceMuted',
  border: '[1px solid var(--colors-border)]',
  borderRadius: '2xl',
  display: 'grid',
  gap: '4',
  p: '6',
  shadow: 'sm',
});

const recipeHeaderClass = css({
  display: 'grid',
  gap: '2',
});

const recipeEyebrowClass = css({
  color: 'primary',
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
});

const recipeTitleClass = css({
  fontSize: 'xl',
  fontWeight: 'semibold',
  lineHeight: 'tight',
});

const recipeDescriptionClass = css({
  color: 'textSubtle',
  lineHeight: 'relaxed',
});

const inlineCodeClass = css({
  bg: 'surface',
  borderRadius: 'md',
  color: 'text',
  fontFamily: 'mono',
  fontSize: 'sm',
  px: '1.5',
  py: '0.5',
});

const showcaseClass = css({
  p: '4',
  borderRadius: 'xl',
  bg: 'surface',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
});
