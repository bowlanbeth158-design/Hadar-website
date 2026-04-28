type Variant = 'color' | 'white';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  variant?: Variant;
  withWordmark?: boolean;
  size?: Size;
};

const SIZE_MAP: Record<Size, { shield: string; text: string; gap: string }> = {
  sm: { shield: 'h-8 w-8', text: 'text-xl', gap: 'gap-2' },
  md: { shield: 'h-10 w-10', text: 'text-2xl', gap: 'gap-2.5' },
  lg: { shield: 'h-12 w-12', text: 'text-3xl', gap: 'gap-2.5' },
};

export const OFFICIAL_LOGO_URL =
  'https://i.postimg.cc/P5FjXRLP/Logo-new-hadar-06-%281%29.png';

export function Logo({ variant = 'color', withWordmark = true, size = 'md' }: Props) {
  const s = SIZE_MAP[size];
  const wordmarkClass =
    variant === 'white'
      ? 'text-white'
      : 'bg-gradient-to-r from-brand-navy via-brand-blue to-sky-400 bg-clip-text text-transparent';

  return (
    <div className={`flex items-center ${s.gap}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={OFFICIAL_LOGO_URL}
        alt=""
        className={`${s.shield} object-contain ${variant === 'white' ? 'brightness-0 invert' : ''}`}
      />
      {withWordmark && (
        <span className={`${s.text} font-bold ${wordmarkClass} tracking-tight`}>Hadar</span>
      )}
    </div>
  );
}
