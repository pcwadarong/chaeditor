'use client';

import React from 'react';

import { Button } from '@/shared/ui/button/button';
import { Input } from '@/shared/ui/input/input';
import { Modal } from '@/shared/ui/modal/modal';
import { Popover } from '@/shared/ui/popover/popover';
import { Textarea } from '@/shared/ui/textarea/textarea';
import { Tooltip } from '@/shared/ui/tooltip/tooltip';

export type MarkdownPrimitiveRegistry = Partial<{
  Button: typeof Button;
  Input: typeof Input;
  Modal: typeof Modal;
  Popover: typeof Popover;
  Textarea: typeof Textarea;
  Tooltip: typeof Tooltip;
}>;

type ResolvedMarkdownPrimitiveRegistry = {
  Button: typeof Button;
  Input: typeof Input;
  Modal: typeof Modal;
  Popover: typeof Popover;
  Textarea: typeof Textarea;
  Tooltip: typeof Tooltip;
};

type MarkdownPrimitiveProviderProps = {
  children: React.ReactNode;
  registry?: MarkdownPrimitiveRegistry;
};

const defaultMarkdownPrimitiveRegistry: ResolvedMarkdownPrimitiveRegistry = {
  Button,
  Input,
  Modal,
  Popover,
  Textarea,
  Tooltip,
};

const MarkdownPrimitiveRegistryContext = React.createContext<ResolvedMarkdownPrimitiveRegistry>(
  defaultMarkdownPrimitiveRegistry,
);

/**
 * Returns the default primitive registry used by the editor UI surface.
 */
export const createDefaultMarkdownPrimitiveRegistry = (): ResolvedMarkdownPrimitiveRegistry =>
  defaultMarkdownPrimitiveRegistry;

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
