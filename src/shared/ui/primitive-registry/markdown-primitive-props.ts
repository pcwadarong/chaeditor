import type React from 'react';

export type ButtonTone = 'white' | 'primary' | 'black';
export type ButtonVariant = 'solid' | 'ghost' | 'underline';
export type ButtonSize = 'xs' | 'sm' | 'md';

export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
  asChild?: boolean;
  fullWidth?: boolean;
  labelClassName?: string;
  leadingVisual?: React.ReactNode;
  leadingVisualClassName?: string;
  size?: ButtonSize;
  tone?: ButtonTone;
  trailingVisual?: React.ReactNode;
  trailingVisualClassName?: string;
  variant?: ButtonVariant;
};

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export type ModalProps = {
  ariaDescribedBy?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  backdropClassName?: string;
  children: React.ReactNode;
  closeAriaLabel: string;
  closeButtonClassName?: string;
  frameClassName?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
};

export type ClosePopover = (options?: { restoreFocus?: boolean }) => void;

export type PopoverProps = {
  children: React.ReactNode | ((args: { closePopover: ClosePopover }) => React.ReactNode);
  isOpen?: boolean;
  label?: string;
  onOpenChange?: (nextOpen: boolean) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  panelClassName?: string;
  panelLabel: string;
  portalPlacement?: 'end' | 'start';
  renderInPortal?: boolean;
  rootClassName?: string;
  triggerAriaLabel?: string;
  triggerClassName?: string;
  triggerContent?: React.ReactNode;
  triggerLabelClassName?: string;
  triggerSize?: ButtonSize;
  triggerTone?: ButtonTone;
  triggerTooltip?: string;
  triggerValueClassName?: string;
  triggerVariant?: ButtonVariant;
  value?: string;
};

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  autoResize?: boolean;
};

export type TooltipTriggerProps = {
  'aria-describedby'?: string;
};

export type TooltipProps = {
  children: React.ReactElement<TooltipTriggerProps>;
  content: string;
  className?: string;
  contentClassName?: string;
  forceOpen?: boolean;
  openOnFocus?: boolean;
  portalClassName?: string;
  preferredPlacement?: 'auto' | 'bottom' | 'top';
};
