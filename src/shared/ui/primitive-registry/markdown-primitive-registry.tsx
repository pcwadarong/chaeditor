'use client';

import React from 'react';

import { createDefaultMarkdownPrimitiveRegistry } from '@/shared/ui/primitive-registry/default-markdown-primitive-registry';
import type {
  MarkdownPrimitiveRegistry,
  ResolvedMarkdownPrimitiveRegistry,
} from '@/shared/ui/primitive-registry/markdown-primitive-contract';

type MarkdownPrimitiveProviderProps = {
  children: React.ReactNode;
  registry?: MarkdownPrimitiveRegistry;
};

const defaultMarkdownPrimitiveRegistry = createDefaultMarkdownPrimitiveRegistry();

const MarkdownPrimitiveRegistryContext = React.createContext<ResolvedMarkdownPrimitiveRegistry>(
  defaultMarkdownPrimitiveRegistry,
);

export { createDefaultMarkdownPrimitiveRegistry };

/**
 * Provides host-overridden primitives to the current editor subtree.
 */
export const MarkdownPrimitiveProvider = ({
  children,
  registry,
}: MarkdownPrimitiveProviderProps) => {
  const value = React.useMemo(
    () => ({
      ...defaultMarkdownPrimitiveRegistry,
      ...registry,
    }),
    [registry],
  );

  return (
    <MarkdownPrimitiveRegistryContext.Provider value={value}>
      {children}
    </MarkdownPrimitiveRegistryContext.Provider>
  );
};

/**
 * Resolves the active primitive registry for editor components.
 */
export const useMarkdownPrimitives = () => React.useContext(MarkdownPrimitiveRegistryContext);
