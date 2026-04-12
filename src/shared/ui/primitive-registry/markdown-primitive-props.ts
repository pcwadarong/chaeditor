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
  /** 포털 렌더링 시 trigger 기준 정렬 방향입니다. */
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
  /** viewport 바깥으로 넘치지 않도록 유지할 최소 여백(px)입니다. */
  viewportPadding?: number;
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
  /** tooltip이 먼저 시도할 기본 배치 방향입니다. */
  preferredPlacement?: 'auto' | 'bottom' | 'top';
  /** viewport 경계와 tooltip 사이에 유지할 최소 여백(px)입니다. */
  viewportPadding?: number;
};
