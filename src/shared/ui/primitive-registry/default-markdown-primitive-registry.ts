import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Modal } from '@/shared/ui/modal';
import { Popover } from '@/shared/ui/popover';
import type { ResolvedMarkdownPrimitiveRegistry } from '@/shared/ui/primitive-registry/markdown-primitive-contract';
import { Textarea } from '@/shared/ui/textarea';
import { Tooltip } from '@/shared/ui/tooltip';

const defaultMarkdownPrimitiveRegistry: ResolvedMarkdownPrimitiveRegistry = {
  Button,
  Input,
  Modal,
  Popover,
  Textarea,
  Tooltip,
};

/**
 * Returns the package's default primitive registry, currently backed by Panda-based components.
 */
export const createDefaultMarkdownPrimitiveRegistry = (): ResolvedMarkdownPrimitiveRegistry =>
  defaultMarkdownPrimitiveRegistry;

/**
 * Returns the currently bundled Panda-backed primitive registry for hosts that want the concrete default shell.
 */
export const createPandaMarkdownPrimitiveRegistry = (): ResolvedMarkdownPrimitiveRegistry =>
  defaultMarkdownPrimitiveRegistry;
