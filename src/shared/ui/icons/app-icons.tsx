import type { ComponentType, ReactElement, SVGProps } from 'react';
import React from 'react';

import AlignCenter from '@/shared/assets/icons/align-center.svg?raw';
import AlignLeft from '@/shared/assets/icons/align-left.svg?raw';
import AlignRight from '@/shared/assets/icons/align-right.svg?raw';
import ArrowCurveLeftRightSvg from '@/shared/assets/icons/arrow-curve-left-right.svg?raw';
import ArrowUpSvg from '@/shared/assets/icons/arrow-up.svg?raw';
import CalendarSvg from '@/shared/assets/icons/calendar.svg?raw';
import ChevronRight from '@/shared/assets/icons/chevron-right.svg?raw';
import CodeBlockSvg from '@/shared/assets/icons/code.svg?raw';
import ColorSvg from '@/shared/assets/icons/color.svg?raw';
import DashSvg from '@/shared/assets/icons/dash.svg?raw';
import EditSvg from '@/shared/assets/icons/edit.svg?raw';
import EyeSvg from '@/shared/assets/icons/eye.svg?raw';
import FileSvg from '@/shared/assets/icons/file.svg?raw';
import FitSizeSvg from '@/shared/assets/icons/fit-size.svg?raw';
import GithubSvg from '@/shared/assets/icons/github.svg?raw';
import GlobeSvg from '@/shared/assets/icons/globe.svg?raw';
import HamburgerSvg from '@/shared/assets/icons/hamburger.svg?raw';
import ImageSvg from '@/shared/assets/icons/image.svg?raw';
import ImageQuestionSvg from '@/shared/assets/icons/image-question.svg?raw';
import KebabSvg from '@/shared/assets/icons/kebab.svg?raw';
import LinkSvg from '@/shared/assets/icons/link.svg?raw';
import LinkExternalSvg from '@/shared/assets/icons/link-external.svg?raw';
import LinkedInSvg from '@/shared/assets/icons/linked-in.svg?raw';
import LockSvg from '@/shared/assets/icons/lock.svg?raw';
import LockOpenSvg from '@/shared/assets/icons/lock_open.svg?raw';
import MailSolidSvg from '@/shared/assets/icons/mail-solid.svg?raw';
import MarkDownBoldSvg from '@/shared/assets/icons/markdown-bold.svg?raw';
import MarkDownItalicSvg from '@/shared/assets/icons/markdown-italic.svg?raw';
import MarkDownStrikeSvg from '@/shared/assets/icons/markdown-strike.svg?raw';
import MarkDownUnderLineSvg from '@/shared/assets/icons/markdown-underline.svg?raw';
import MoonSvg from '@/shared/assets/icons/moon.svg?raw';
import PauseSvg from '@/shared/assets/icons/pause.svg?raw';
import QuoteSvg from '@/shared/assets/icons/quote.svg?raw';
import ReportSvg from '@/shared/assets/icons/report.svg?raw';
import SearchSvg from '@/shared/assets/icons/search.svg?raw';
import SendSvg from '@/shared/assets/icons/send.svg?raw';
import ShareSvg from '@/shared/assets/icons/share.svg?raw';
import SpoilerSvg from '@/shared/assets/icons/spoiler.svg?raw';
import SubtextSvg from '@/shared/assets/icons/subtext.svg?raw';
import SunSvg from '@/shared/assets/icons/sun.svg?raw';
import SystemSvg from '@/shared/assets/icons/system.svg?raw';
import TableSvg from '@/shared/assets/icons/table.svg?raw';
import TextBgColorSvg from '@/shared/assets/icons/text-bg-color.svg?raw';
import TrashSvg from '@/shared/assets/icons/trash.svg?raw';
import YoutubeSvg from '@/shared/assets/icons/youtube.svg?raw';
import ZoomInSvg from '@/shared/assets/icons/zoom-in.svg?raw';
import ZoomOutSvg from '@/shared/assets/icons/zoom-out.svg?raw';

type AppIconColor =
  | 'black'
  | 'current'
  | 'error'
  | 'muted'
  | 'primary'
  | 'surface'
  | 'text'
  | 'white';
type AppIconSize = 'lg' | 'md' | 'sm' | number;

const iconColorMap: Record<Exclude<AppIconColor, 'current'>, string> = {
  black: 'var(--colors-black)',
  error: 'var(--colors-error)',
  muted: 'var(--colors-muted)',
  primary: 'var(--colors-primary)',
  surface: 'var(--colors-surface)',
  text: 'var(--colors-text)',
  white: 'var(--colors-white)',
};

const iconSizeMap: Record<Exclude<AppIconSize, number>, number> = {
  lg: 20,
  md: 16,
  sm: 14,
};

export type AppIconProps = Omit<SVGProps<SVGSVGElement>, 'color' | 'height' | 'width'> & {
  alt?: string;
  color?: AppIconColor;
  customColor?: string;
  size?: AppIconSize;
};
export type AppIconComponent = (props: AppIconProps) => ReactElement;

type RawSvgModule = {
  default?: string;
  src?: string;
};

type IconSource = ComponentType<SVGProps<SVGSVGElement>> | RawSvgModule | string;

const baseIconStyle: React.CSSProperties = {
  display: 'block',
  flex: '0 0 auto',
  verticalAlign: 'middle',
};

type SvgMarkupIconProps = {
  accessibleLabel?: string;
  className?: string;
  isDecorative: boolean;
  markup: string | null;
  role?: string;
  size: number;
  style: React.CSSProperties;
};

/**
 * Resolves an icon size token or numeric size to a pixel value.
 */
const resolveIconSize = (size: AppIconSize): number =>
  typeof size === 'number' ? size : iconSizeMap[size];

/**
 * Resolves an icon color token or returns null when the icon should inherit its parent color.
 */
const resolveIconColor = ({
  color,
  customColor,
}: Pick<AppIconProps, 'color' | 'customColor'>): string | null => {
  if (customColor) return customColor;
  if (!color || color === 'current') return null;

  return iconColorMap[color];
};

/**
 * Resolves raw SVG markup from either a direct string import or a module wrapper.
 */
const resolveRawSvgMarkup = (svgSource: RawSvgModule | string): string | null => {
  if (typeof svgSource === 'string') return svgSource;
  if (svgSource && typeof svgSource.default === 'string') return svgSource.default;

  return null;
};

/**
 * Normalizes raw SVG markup so it behaves like a lightweight icon primitive.
 */
const normalizeSvgMarkup = (svgMarkup: string): string =>
  svgMarkup
    .replace(/\s(width|height)="[^"]*"/gi, '')
    .replace(/\s(fill|stroke)="(?!none|currentColor)[^"]*"/gi, '')
    .replace(
      /<svg\b([^>]*)\sstyle="([^"]*)"/i,
      '<svg$1 style="$2; color: inherit; display: block;" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"',
    )
    .replace(
      /<svg\b([^>]*)>/i,
      '<svg$1 style="color: inherit; display: block;" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">',
    );

/**
 * Resolves an asset URL when the bundler exposes the SVG as a file reference.
 */
const resolveSvgAssetUrl = (svgSource: RawSvgModule | string): string | null => {
  if (typeof svgSource === 'string') return null;
  if (svgSource && typeof svgSource.src === 'string') return svgSource.src;

  return null;
};

/**
 * Resolves a component-based icon source such as lucide-react or a custom SVG component.
 */
const resolveComponentIcon = (
  svgSource: IconSource,
): ComponentType<SVGProps<SVGSVGElement>> | null =>
  typeof svgSource === 'function' ? svgSource : null;

/**
 * Narrows an icon source to the raw SVG branch.
 */
const isRawSvgSource = (svgSource: IconSource): svgSource is string | RawSvgModule =>
  typeof svgSource !== 'function';

/**
 * Renders inline SVG markup so icons can inherit the surrounding text color.
 */
const SvgMarkupIcon = ({
  accessibleLabel,
  className,
  isDecorative,
  markup,
  role,
  size,
  style,
}: SvgMarkupIconProps) => (
  <span
    aria-hidden={isDecorative ? true : undefined}
    aria-label={isDecorative ? undefined : accessibleLabel}
    className={className}
    dangerouslySetInnerHTML={{ __html: markup ?? '' }}
    role={isDecorative ? undefined : (role ?? 'img')}
    style={{
      ...style,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      lineHeight: 0,
      overflow: 'hidden',
    }}
  />
);

/**
 * Wraps an SVG module with the shared icon props and style contract.
 */
const createAppIcon = (
  svgSource: IconSource,
  {
    defaultSize = 16,
  }: {
    defaultSize?: number;
  } = {},
) => {
  const ComponentIcon = resolveComponentIcon(svgSource);
  const rawSvgMarkup =
    !ComponentIcon && isRawSvgSource(svgSource) ? resolveRawSvgMarkup(svgSource) : null;
  const svgAssetUrl =
    !ComponentIcon && isRawSvgSource(svgSource) ? resolveSvgAssetUrl(svgSource) : null;

  /**
   * Shared SVG icon component.
   */
  const AppIcon: AppIconComponent = ({
    alt,
    color = 'current',
    customColor,
    size = defaultSize,
    style,
    ...props
  }: AppIconProps) => {
    const [assetSvgMarkup, setAssetSvgMarkup] = React.useState<string | null>(null);
    const resolvedSize = resolveIconSize(size);
    const resolvedColor = resolveIconColor({ color, customColor });
    const svgMarkup = React.useMemo(
      () => (rawSvgMarkup ? normalizeSvgMarkup(rawSvgMarkup) : assetSvgMarkup),
      [assetSvgMarkup],
    );
    const iconStyle: React.CSSProperties = {
      ...baseIconStyle,
      ...style,
    };

    if (resolvedColor) {
      iconStyle.color = resolvedColor;
    }

    const isDecorative = props['aria-hidden'] === true || props['aria-hidden'] === 'true';
    const accessibleLabel = props['aria-label'] ?? alt;

    React.useEffect(() => {
      if (!svgAssetUrl) return;

      let isActive = true;

      void fetch(svgAssetUrl)
        .then(async response => {
          if (!response.ok) {
            throw new Error(`Failed to load icon asset: ${svgAssetUrl}`);
          }

          return response.text();
        })
        .then(markup => {
          if (!isActive) return;
          setAssetSvgMarkup(normalizeSvgMarkup(markup));
        })
        .catch(() => {
          if (!isActive) return;
          setAssetSvgMarkup(null);
        });

      return () => {
        isActive = false;
      };
    }, []);

    if (ComponentIcon) {
      return (
        <ComponentIcon
          aria-label={isDecorative ? undefined : accessibleLabel}
          focusable="false"
          height={resolvedSize}
          style={iconStyle}
          width={resolvedSize}
          {...props}
        />
      );
    }

    const { className, ref: _ref, role, ...restProps } = props;
    const spanProps = restProps as unknown as React.HTMLAttributes<HTMLSpanElement>;

    if (svgMarkup) {
      return (
        <SvgMarkupIcon
          accessibleLabel={accessibleLabel}
          className={className}
          isDecorative={isDecorative}
          markup={svgMarkup}
          role={role}
          size={resolvedSize}
          style={iconStyle}
          {...spanProps}
        />
      );
    }

    return (
      <span
        aria-hidden
        className={className}
        style={{ ...iconStyle, width: resolvedSize, height: resolvedSize }}
      />
    );
  };

  return AppIcon;
};

export const AlignCenterIcon = createAppIcon(AlignCenter);
export const AlignLeftIcon = createAppIcon(AlignLeft);
export const AlignRightIcon = createAppIcon(AlignRight);
export const ArrowCurveLeftRightIcon = createAppIcon(ArrowCurveLeftRightSvg);
export const ArrowUpIcon = createAppIcon(ArrowUpSvg);
export const CalendarIcon = createAppIcon(CalendarSvg);
export const ChevronRightIcon = createAppIcon(ChevronRight);
export const EditIcon = createAppIcon(EditSvg);
export const EyeIcon = createAppIcon(EyeSvg);
export const HamburgerIcon = createAppIcon(HamburgerSvg);
export const KebabIcon = createAppIcon(KebabSvg);
export const FitSizeIcon = createAppIcon(FitSizeSvg);
export const GithubIcon = createAppIcon(GithubSvg);
export const GlobeIcon = createAppIcon(GlobeSvg);
export const LinkExternalIcon = createAppIcon(LinkExternalSvg);
export const LinkedInIcon = createAppIcon(LinkedInSvg);
export const LinkIcon = createAppIcon(LinkSvg);
export const LockIcon = createAppIcon(LockSvg);
export const LockOpenIcon = createAppIcon(LockOpenSvg);
export const MailSolidIcon = createAppIcon(MailSolidSvg);
export const MoonIcon = createAppIcon(MoonSvg);
export const PauseIcon = createAppIcon(PauseSvg);
export const ImageQuestionIcon = createAppIcon(ImageQuestionSvg);
export const ReportIcon = createAppIcon(ReportSvg);
export const SearchIcon = createAppIcon(SearchSvg);
export const SendIcon = createAppIcon(SendSvg);
export const ShareIcon = createAppIcon(ShareSvg);
export const SunIcon = createAppIcon(SunSvg);
export const SystemIcon = createAppIcon(SystemSvg);
export const TrashIcon = createAppIcon(TrashSvg);
export const FileIcon = createAppIcon(FileSvg);
export const MarkDownBoldIcon = createAppIcon(MarkDownBoldSvg);
export const MarkDownItalicIcon = createAppIcon(MarkDownItalicSvg);
export const MarkDownStrikeIcon = createAppIcon(MarkDownStrikeSvg);
export const MarkDownUnderlineIcon = createAppIcon(MarkDownUnderLineSvg);
export const QuoteIcon = createAppIcon(QuoteSvg);
export const CodeBlockIcon = createAppIcon(CodeBlockSvg);
export const ImageIcon = createAppIcon(ImageSvg);
export const TableIcon = createAppIcon(TableSvg);
export const DashIcon = createAppIcon(DashSvg);
export const SpoilerIcon = createAppIcon(SpoilerSvg);
export const ColorIcon = createAppIcon(ColorSvg);
export const TextBgColorIcon = createAppIcon(TextBgColorSvg);
export const YoutubeIcon = createAppIcon(YoutubeSvg);
export const SubtextIcon = createAppIcon(SubtextSvg);
export const ZoomInIcon = createAppIcon(ZoomInSvg);
export const ZoomOutIcon = createAppIcon(ZoomOutSvg);
