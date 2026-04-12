import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { css } from 'styled-system/css';

import {
  emotionPrimitiveUsageSnippet,
  emotionThemeUsageSnippet,
  primitiveRegistryUsageSnippet,
  styledComponentsPrimitiveUsageSnippet,
  styledComponentsThemeUsageSnippet,
  tailwindPrimitiveUsageSnippet,
  tailwindThemeUsageSnippet,
  vanillaExtractPrimitiveUsageSnippet,
  vanillaExtractThemeUsageSnippet,
} from '@/stories/support/storybook-code-snippets';
import {
  StorybookBulletList,
  storybookDocsHeaderDescriptionFullWidthClass,
  storybookDocsPageClass,
  storybookDocsSectionClass,
  StorybookDocsSectionHeader,
  StorybookDocsTabBar,
  StorybookPageHeader,
} from '@/stories/support/storybook-docs';
import { StorybookCodeBlock } from '@/stories/support/storybook-reference-ui';
import {
  StorybookPrimitiveRegistryShowcase,
  StorybookRuntimePrimitiveRegistryShowcase,
} from '@/stories/support/storybook-runtime-primitives';

type RuntimeRecipeProps = {
  description: string;
  eyebrow: string;
  primitiveSnippet: string;
  runtime: 'emotion' | 'styled-components' | 'tailwind' | 'vanilla-extract';
  subheading: string;
  themeSnippet: string;
  title: string;
};

type PrimitiveRegistryRecipeProps = {
  description: string;
  eyebrow: string;
  snippetLabel: string;
  title: string;
};

type RecipeId =
  | 'tailwind'
  | 'emotion'
  | 'styled-components'
  | 'vanilla-extract'
  | 'primitive-shell-replacement';

type RecipeDefinition =
  | ({ id: RecipeId; label: string; kind: 'runtime' } & RuntimeRecipeProps)
  | ({ id: RecipeId; label: string; kind: 'primitive' } & PrimitiveRegistryRecipeProps);

const RECIPE_DEFINITIONS = [
  {
    description:
      'Use this when your app already uses Tailwind and you want to scope chaeditor tokens inside an existing utility-driven design system.',
    eyebrow: 'Tailwind CSS',
    id: 'tailwind',
    kind: 'runtime',
    label: 'Tailwind CSS',
    primitiveSnippet: tailwindPrimitiveUsageSnippet,
    runtime: 'tailwind',
    subheading: 'Optional primitive overrides',
    themeSnippet: tailwindThemeUsageSnippet,
    title: 'Tailwind CSS',
  },
  {
    description:
      'Use this when your app already relies on Emotion for wrapper scopes and component-level overrides.',
    eyebrow: 'Emotion',
    id: 'emotion',
    kind: 'runtime',
    label: 'Emotion',
    primitiveSnippet: emotionPrimitiveUsageSnippet,
    runtime: 'emotion',
    subheading: 'Optional primitive overrides',
    themeSnippet: emotionThemeUsageSnippet,
    title: 'Emotion',
  },
  {
    description:
      'Use this when your app already uses styled-components and you want the editor to inherit that runtime instead of introducing a second override style.',
    eyebrow: 'styled-components',
    id: 'styled-components',
    kind: 'runtime',
    label: 'styled-components',
    primitiveSnippet: styledComponentsPrimitiveUsageSnippet,
    runtime: 'styled-components',
    subheading: 'Optional primitive overrides',
    themeSnippet: styledComponentsThemeUsageSnippet,
    title: 'styled-components',
  },
  {
    description:
      'Use this when your app already uses vanilla-extract contracts and you want editor theming to stay type-safe and file-scoped.',
    eyebrow: 'vanilla-extract',
    id: 'vanilla-extract',
    kind: 'runtime',
    label: 'vanilla-extract',
    primitiveSnippet: vanillaExtractPrimitiveUsageSnippet,
    runtime: 'vanilla-extract',
    subheading: 'Optional primitive overrides',
    themeSnippet: vanillaExtractThemeUsageSnippet,
    title: 'vanilla-extract',
  },
  {
    description:
      'Use this when tokens are already acceptable but the host must replace button, input, popover, modal, or tooltip shells with product-owned primitives.',
    eyebrow: 'Primitive shell replacement',
    id: 'primitive-shell-replacement',
    kind: 'primitive',
    label: 'Primitive shell replacement',
    snippetLabel: 'Shell override',
    title: 'Primitive shell replacement',
  },
] as const satisfies readonly RecipeDefinition[];

const recipeOverviewRows = [
  {
    approach: 'Tailwind CSS',
    primitiveShells: 'Optional',
    themeVariables: 'Override with wrapper class',
    when: 'Your app already uses Tailwind for layout and color tokens',
  },
  {
    approach: 'Emotion',
    primitiveShells: 'Optional',
    themeVariables: 'Override via css prop or styled()',
    when: 'Your app uses Emotion for CSS-in-JS',
  },
  {
    approach: 'styled-components',
    primitiveShells: 'Optional',
    themeVariables: 'Override via styled() wrapper',
    when: 'Your app uses styled-components',
  },
  {
    approach: 'vanilla-extract',
    primitiveShells: 'Optional',
    themeVariables: 'Override with contract or style scope',
    when: 'Your app uses vanilla-extract for type-safe styles',
  },
  {
    approach: 'Primitive shell replacement',
    primitiveShells: 'Replace via registry',
    themeVariables: 'Keep current values',
    when: 'You want to swap button, input, or modal shells without changing the theme runtime',
  },
] as const;

/**
 * Resolves the active recipe definition for the current tab.
 */
const getRecipeDefinition = (id: RecipeId) =>
  RECIPE_DEFINITIONS.find(recipe => recipe.id === id) ?? RECIPE_DEFINITIONS[0];

/**
 * Renders the active recipe guidance, code snippet, and live preview.
 */
const StylingRecipePanel = ({ recipe }: { recipe: RecipeDefinition }) => {
  if (recipe.kind === 'primitive') {
    return (
      <>
        <div className={recipeBlockClass}>
          <p className={recipeSubheadingClass}>When to use this recipe</p>
          <p className={recipeBodyClass}>{recipe.description}</p>
        </div>
        <div className={recipeBlockClass}>
          <p className={recipeSubheadingClass}>Primitive registry override</p>
          <p className={recipeBodyClass}>
            Preserve overlay behavior as part of the replacement. The host primitive can restyle the
            shell, but it should still honor placement, viewport safety, focus, and dismiss
            contracts.
          </p>
          <StorybookCodeBlock code={primitiveRegistryUsageSnippet} label={recipe.snippetLabel} />
        </div>
        <div className={recipeBlockClass}>
          <p className={recipeSubheadingClass}>Overlay parameters to keep visible</p>
          <StorybookBulletList
            items={[
              <>
                <code>viewportPadding</code> keeps popovers and tooltips away from the viewport
                edge. Use a host default like <code>8</code>, <code>10</code>, or <code>12</code> if
                your shell needs a stable minimum inset.
              </>,
              <>
                <code>portalPlacement</code> and <code>preferredPlacement</code> should be passed
                through unless your host wrapper is intentionally forcing one direction.
              </>,
              <>
                <code>Modal</code> wrappers should keep focus entry, close behavior, and scroll
                locking intact even when the frame and backdrop are fully replaced.
              </>,
              'Verify overlays near viewport edges, not just centered examples, before shipping a custom primitive registry.',
            ]}
          />
        </div>
        <div className={recipeBlockClass}>
          <p className={recipeSubheadingClass}>Live preview</p>
          <StorybookPrimitiveRegistryShowcase />
        </div>
      </>
    );
  }

  return (
    <>
      <div className={recipeBlockClass}>
        <p className={recipeSubheadingClass}>When to use this runtime</p>
        <p className={recipeBodyClass}>{recipe.description}</p>
      </div>
      <div className={recipeBlockClass}>
        <p className={recipeSubheadingClass}>Theme token override</p>
        <StorybookCodeBlock code={recipe.themeSnippet} label="Theme scope" />
      </div>
      <div className={recipeBlockClass}>
        <p className={recipeSubheadingClass}>{recipe.subheading}</p>
        <StorybookCodeBlock code={recipe.primitiveSnippet} label="Primitive registry" />
      </div>
      <div className={recipeBlockClass}>
        <p className={recipeSubheadingClass}>Live preview</p>
        <StorybookRuntimePrimitiveRegistryShowcase runtime={recipe.runtime} />
      </div>
    </>
  );
};

const StylingRecipesOverviewPage = () => {
  const [activeRecipeId, setActiveRecipeId] = useState<RecipeId>('tailwind');
  const activeRecipe = getRecipeDefinition(activeRecipeId);

  return (
    <main className={storybookDocsPageClass}>
      <StorybookPageHeader
        title="Override theme tokens or replace primitive shells for your CSS runtime"
        description="chaeditor ships with Panda CSS as its default styling runtime. The recipes on this page cover host-side overrides only. Read this guide when you need to scope your app's theme variables or replace a primitive shell like a button, input, or modal."
        descriptionClassName={storybookDocsHeaderDescriptionFullWidthClass}
      />

      <section className={storybookDocsSectionClass}>
        <StorybookDocsSectionHeader
          description="Each recipe covers a different CSS runtime. Pick the one that matches your app stack. Theme token overrides and primitive shell replacement are independent decisions, so you can keep one side as-is while customizing the other."
          eyebrow="When to use a recipe"
          title="Choose the override path that matches your styling runtime"
        />
        <table className={overviewTableClass}>
          <thead>
            <tr>
              <th>Recipe</th>
              <th>When it fits</th>
              <th>Theme variables</th>
              <th>Primitive shells</th>
            </tr>
          </thead>
          <tbody>
            {recipeOverviewRows.map(row => (
              <tr key={row.approach}>
                <td>{row.approach}</td>
                <td>{row.when}</td>
                <td>{row.themeVariables}</td>
                <td>{row.primitiveShells}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={storybookDocsSectionClass}>
        <StorybookDocsSectionHeader
          description="Use the tab bar to switch between runtime-specific recipes without leaving this page."
          eyebrow="Recipe guide"
          title={activeRecipe.title}
          titleAs="h2"
        />
        <div className={recipeTabRegionClass}>
          <StorybookDocsTabBar
            current={activeRecipeId}
            onSelect={setActiveRecipeId}
            options={RECIPE_DEFINITIONS.map(recipe => ({ id: recipe.id, label: recipe.label }))}
          />
        </div>
        <div className={recipePanelClass}>
          <StylingRecipePanel recipe={activeRecipe} />
        </div>
      </section>
    </main>
  );
};

const meta = {
  component: StylingRecipesOverviewPage,
  parameters: {
    docs: {
      source: {
        code: tailwindThemeUsageSnippet,
      },
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs', '!dev'],
  title: 'Introduction/Styling Recipes',
} satisfies Meta<typeof StylingRecipesOverviewPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const overviewTableClass = css({
  tableLayout: 'fixed',
  borderCollapse: 'collapse',
  marginTop: '6',
  width: 'full',
  '& th': {
    borderBottom: '[1px solid var(--colors-border)]',
    color: 'text',
    fontFamily: "['Manrope',system-ui,sans-serif]",
    fontSize: 'xs',
    fontWeight: 'semibold',
    letterSpacing: 'wide',
    paddingBlock: '3',
    paddingInline: '3',
    textAlign: 'left',
    textTransform: 'uppercase',
    verticalAlign: 'top',
  },
  '& td': {
    borderBottom: '[1px solid var(--colors-border)]',
    color: 'textSubtle',
    fontSize: 'sm',
    lineHeight: 'loose',
    paddingBlock: '4',
    paddingInline: '3',
    textAlign: 'left',
    verticalAlign: 'top',
  },
  '& td:first-child': {
    color: 'text',
    fontWeight: 'medium',
    whiteSpace: 'normal',
  },
  '& tbody tr:last-child td': {
    borderBottomWidth: '0',
  },
});

const recipeTabRegionClass = css({
  marginTop: '3',
});

const recipePanelClass = css({
  display: 'flex',
  flexDirection: 'column',
  marginTop: '4',
});

const recipeBlockClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
  paddingBottom: '10',
});

const recipeSubheadingClass = css({
  color: 'text',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'sm',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
});

const recipeBodyClass = css({
  color: 'textSubtle',
  fontSize: 'md',
  lineHeight: 'loose',
});
