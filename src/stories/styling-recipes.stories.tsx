import { Description, Stories, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { css, cx } from 'styled-system/css';

import {
  emotionPrimitiveUsageSnippet,
  emotionThemeUsageSnippet,
  pageClass,
  primitiveRegistryUsageSnippet,
  StorybookCodeBlock,
  StorybookPrimitiveRegistryShowcase,
  StorybookRuntimePrimitiveRegistryShowcase,
  styledComponentsPrimitiveUsageSnippet,
  styledComponentsThemeUsageSnippet,
  tailwindPrimitiveUsageSnippet,
  tailwindThemeUsageSnippet,
  vanillaExtractPrimitiveUsageSnippet,
  vanillaExtractThemeUsageSnippet,
} from '@/stories/storybook-fixtures';

type RuntimeRecipePageProps = {
  description: string;
  eyebrow: string;
  primitiveSnippet: string;
  runtime: 'emotion' | 'styled-components' | 'tailwind' | 'vanilla-extract';
  subheading: string;
  themeSnippet: string;
  title: string;
};

type PrimitiveRegistryPageProps = {
  description: string;
  eyebrow: string;
  snippetLabel?: string;
  title: string;
};

const RECIPE_INDEX = [
  'Tailwind CSS',
  'Emotion',
  'styled-components',
  'vanilla-extract',
  'Primitive shell replacement',
];

const RecipeIndexBar = ({ current }: { current: string }) => (
  <div className={recipeIndexBarClass}>
    {RECIPE_INDEX.map(name => (
      <span
        key={name}
        className={name === current ? recipeIndexItemActiveClass : recipeIndexItemClass}
      >
        {name}
      </span>
    ))}
  </div>
);

const StylingRecipesOverviewPage = () => (
  <main className={pageClass}>
    <section className={sectionClass}>
      <div className={overviewHeaderClass}>
        <h1 className={overviewTitleClass}>Host-side styling recipes</h1>
        <p className={recipeDescriptionClass}>
          The package ships with Panda-based default primitives and theme tokens. Use the recipes
          below only when the host app wants to override variables or replace primitive shells.
        </p>
        <ul className={overviewLibraryListClass}>
          <li>Tailwind</li>
          <li>Emotion</li>
          <li>styled-components</li>
          <li>vanilla-extract</li>
          <li>Primitive shell replacement</li>
        </ul>
      </div>
    </section>
  </main>
);

const RuntimeRecipePage = ({
  description,
  eyebrow,
  primitiveSnippet,
  runtime,
  subheading,
  themeSnippet,
  title,
}: RuntimeRecipePageProps) => (
  <main className={pageClass}>
    <section className={sectionClass}>
      <RecipeIndexBar current={eyebrow} />
      <article className={recipeCardClass}>
        <div className={recipeHeaderClass}>
          <p className={recipeEyebrowClass}>{eyebrow}</p>
          <h2 className={recipeTitleClass}>{title}</h2>
        </div>
        <p className={recipeDescriptionClass}>{description}</p>
        <p className={recipeSubheadingClass}>{subheading}</p>
        <StorybookCodeBlock code={themeSnippet} label="Theme scope" />
        <StorybookCodeBlock code={primitiveSnippet} label="Primitive registry" />
        <div className={runtimePreviewClass}>
          <StorybookRuntimePrimitiveRegistryShowcase runtime={runtime} />
        </div>
      </article>
    </section>
  </main>
);

const PrimitiveRegistryPage = ({
  description,
  eyebrow,
  snippetLabel = 'Primitive registry',
  title,
}: PrimitiveRegistryPageProps) => (
  <main className={pageClass}>
    <section className={sectionClass}>
      <RecipeIndexBar current={eyebrow} />
      <article className={recipeCardClass}>
        <div className={recipeHeaderClass}>
          <p className={recipeEyebrowClass}>{eyebrow}</p>
          <h2 className={recipeTitleClass}>{title}</h2>
        </div>
        <p className={recipeDescriptionClass}>{description}</p>
        <StorybookCodeBlock code={primitiveRegistryUsageSnippet} label={snippetLabel} />
        <div className={showcaseClass}>
          <StorybookPrimitiveRegistryShowcase />
        </div>
      </article>
    </section>
  </main>
);

const StylingRecipesDocsSummary = () => (
  <section className={docsSummaryClass}>
    <table className={docsSummaryTableClass}>
      <thead>
        <tr>
          <th>Recipe</th>
          <th>Theme variables</th>
          <th>Primitive shells</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Panda CSS</td>
          <td>Default package runtime</td>
          <td>Default package shells</td>
        </tr>
        <tr>
          <td>Tailwind</td>
          <td>Override</td>
          <td>Optional</td>
        </tr>
        <tr>
          <td>Emotion</td>
          <td>Override</td>
          <td>Optional</td>
        </tr>
        <tr>
          <td>styled-components</td>
          <td>Override</td>
          <td>Optional</td>
        </tr>
        <tr>
          <td>vanilla-extract</td>
          <td>Override</td>
          <td>Optional</td>
        </tr>
        <tr>
          <td>Primitive shell replacement</td>
          <td>Keep current values</td>
          <td>Replace</td>
        </tr>
      </tbody>
    </table>
  </section>
);

const StylingRecipesDocsPage = () => (
  <>
    <Title />
    <Description />
    <StylingRecipesDocsSummary />
    <Stories />
  </>
);

const meta = {
  component: StylingRecipesOverviewPage,
  parameters: {
    docs: {
      description: {
        component:
          'The package uses Panda CSS by default. These docs only cover host-side overrides for Tailwind CSS, Emotion, styled-components, vanilla-extract, and primitive shell replacement.',
      },
      page: StylingRecipesDocsPage,
      source: {
        code: tailwindThemeUsageSnippet,
      },
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  title: 'Introduction/Styling Recipes',
} satisfies Meta<typeof StylingRecipesOverviewPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Tailwind: Story = {
  args: {
    description:
      'Provides a Tailwind theme scope example and an optional primitive registry example.',
    eyebrow: 'Tailwind CSS',
    primitiveSnippet: tailwindPrimitiveUsageSnippet,
    runtime: 'tailwind',
    subheading: 'Optional primitive overrides',
    themeSnippet: tailwindThemeUsageSnippet,
    title: 'Tailwind CSS',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the Tailwind wrapper pattern for theme variables and primitive overrides.',
      },
      source: {
        code: tailwindPrimitiveUsageSnippet,
      },
    },
  },
  render: args => <RuntimeRecipePage {...(args as RuntimeRecipePageProps)} />,
};

export const Emotion: Story = {
  args: {
    description: 'Provides an Emotion wrapper example for theme variables and primitive overrides.',
    eyebrow: 'Emotion',
    primitiveSnippet: emotionPrimitiveUsageSnippet,
    runtime: 'emotion',
    subheading: 'Optional primitive overrides',
    themeSnippet: emotionThemeUsageSnippet,
    title: 'Emotion',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the Emotion wrapper pattern for theme variables and primitive overrides.',
      },
      source: {
        code: emotionPrimitiveUsageSnippet,
      },
    },
  },
  render: args => <RuntimeRecipePage {...(args as RuntimeRecipePageProps)} />,
};

export const StyledComponents: Story = {
  args: {
    description:
      'Provides a styled-components wrapper example for theme variables and primitive overrides.',
    eyebrow: 'styled-components',
    primitiveSnippet: styledComponentsPrimitiveUsageSnippet,
    runtime: 'styled-components',
    subheading: 'Optional primitive overrides',
    themeSnippet: styledComponentsThemeUsageSnippet,
    title: 'styled-components',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the styled-components wrapper pattern for theme variables and primitive overrides.',
      },
      source: {
        code: styledComponentsPrimitiveUsageSnippet,
      },
    },
  },
  render: args => <RuntimeRecipePage {...(args as RuntimeRecipePageProps)} />,
};

export const VanillaExtract: Story = {
  args: {
    description:
      'Provides a vanilla-extract scope example for theme variables and primitive overrides.',
    eyebrow: 'vanilla-extract',
    primitiveSnippet: vanillaExtractPrimitiveUsageSnippet,
    runtime: 'vanilla-extract',
    subheading: 'Optional primitive overrides',
    themeSnippet: vanillaExtractThemeUsageSnippet,
    title: 'vanilla-extract',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the vanilla-extract scope pattern for theme variables and primitive overrides.',
      },
      source: {
        code: vanillaExtractPrimitiveUsageSnippet,
      },
    },
  },
  render: args => <RuntimeRecipePage {...(args as RuntimeRecipePageProps)} />,
};

export const PrimitiveRegistry: Story = {
  args: {
    description:
      'Swaps the actual button, input, textarea, popover, modal, and tooltip shells without changing editor logic. This sits on top of the default Panda implementation instead of replacing the theme runtime itself.',
    eyebrow: 'Primitive shell replacement',
    snippetLabel: 'Shell override',
    title: 'Primitive shell replacement',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows how to replace the built-in Panda-backed button, input, popover, modal, and tooltip shells while keeping the editor feature logic unchanged.',
      },
      source: {
        code: primitiveRegistryUsageSnippet,
      },
    },
  },
  render: args => <PrimitiveRegistryPage {...(args as PrimitiveRegistryPageProps)} />,
};

const sectionClass = css({
  display: 'grid',
  gap: '6',
  marginInline: 'auto',
  maxWidth: '6xl',
});

const overviewHeaderClass = css({
  display: 'grid',
  gap: '3',
});

const overviewTitleClass = css({
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: '2xl',
  fontWeight: 'semibold',
  lineHeight: 'tight',
  color: 'text',
});

const overviewLibraryListClass = css({
  display: 'grid',
  gap: '2',
  listStyle: 'disc',
  paddingInlineStart: '5',
  fontSize: 'sm',
  color: 'textSubtle',
  lineHeight: 'relaxed',
});

const recipeCardClass = css({
  display: 'grid',
  gap: '4',
  paddingBlock: '1',
});

const recipeHeaderClass = css({
  display: 'grid',
  gap: '2',
});

const recipeEyebrowClass = css({
  color: 'primary',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'widest',
  textTransform: 'uppercase',
});

const recipeTitleClass = css({
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'xl',
  fontWeight: 'semibold',
  lineHeight: 'tight',
});

const recipeDescriptionClass = css({
  color: 'textSubtle',
  lineHeight: 'relaxed',
});

const recipeSubheadingClass = css({
  color: 'primary',
  fontSize: 'sm',
  fontWeight: 'semibold',
});

const showcaseClass = css({
  paddingBlockStart: '1',
});

const runtimePreviewClass = css({
  paddingBlockStart: '1',
});

const docsSummaryClass = css({
  marginBlock: '6',
});

const recipeIndexBarClass = css({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1',
});

const recipeIndexItemBaseClass = css({
  borderRadius: 'full',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
  px: '3',
  py: '1',
  textTransform: 'uppercase',
});

const recipeIndexItemClass = cx(recipeIndexItemBaseClass, css({ color: 'muted' }));

const recipeIndexItemActiveClass = cx(
  recipeIndexItemBaseClass,
  css({
    backgroundColor: 'primarySubtle',
    color: 'primary',
  }),
);

const docsSummaryTableClass = css({
  borderCollapse: 'collapse',
  width: 'full',
  '& th': {
    borderBottom: '[1px solid var(--colors-border)]',
    color: 'text',
    fontSize: 'xs',
    fontWeight: 'semibold',
    letterSpacing: 'wide',
    paddingBlock: '3',
    paddingInline: '3',
    textAlign: 'left',
    textTransform: 'uppercase',
  },
  '& td': {
    borderBottom: '[1px solid var(--colors-border)]',
    color: 'textSubtle',
    fontSize: 'sm',
    lineHeight: 'relaxed',
    paddingBlock: '3',
    paddingInline: '3',
    verticalAlign: 'top',
  },
  '& td:first-child': {
    color: 'text',
    fontWeight: 'medium',
  },
  '& tbody tr:last-child td': {
    borderBottomWidth: '0',
  },
});
