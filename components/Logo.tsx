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
  lg: { shield: 'h-14 w-14', text: 'text-4xl', gap: 'gap-3' },
};

export function Logo({ variant = 'color', withWordmark = true, size = 'md' }: Props) {
  const s = SIZE_MAP[size];
  const wordmarkColor = variant === 'white' ? 'text-white' : 'text-brand-navy';

  return (
    <div className={`flex items-center ${s.gap}`}>
      <HadarShield className={s.shield} variant={variant} />
      {withWordmark && (
        <span className={`${s.text} font-bold ${wordmarkColor} tracking-tight`}>
          Hadar<span className="opacity-70">.ma</span>
        </span>
      )}
    </div>
  );
}

function HadarShield({ className, variant }: { className: string; variant: Variant }) {
  const gradId = `hadar-grad-${variant}`;
  const shieldFill = `url(#${gradId})`;
  const hFill = variant === 'white' ? '#00327D' : '#ffffff';

  return (
    <svg
      className={className}
      viewBox="0 0 220 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="30" y1="230" x2="190" y2="10" gradientUnits="userSpaceOnUse">
          {variant === 'white' ? (
            <>
              <stop offset="0" stopColor="#F7F9FB" />
              <stop offset="1" stopColor="#ffffff" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#00327D" />
              <stop offset="0.55" stopColor="#0F4DA0" />
              <stop offset="1" stopColor="#1E74C9" />
            </>
          )}
        </linearGradient>
      </defs>
      {/* Shield — battlement top (two towers + central chevron) + side brackets + rounded point bottom */}
      <path
        fill={shieldFill}
        d="M55 30 L85 30 L85 55 L110 30 L135 55 L135 30 L165 30 L165 45 L180 45 L180 95 L165 95 L165 140 C165 180 140 210 110 225 C80 210 55 180 55 140 L55 95 L40 95 L40 45 L55 45 Z"
      />
      {/* Letter H */}
      <path
        fill={hFill}
        d="M75 75 L97 75 L97 115 L123 115 L123 75 L145 75 L145 185 L123 185 L123 135 L97 135 L97 185 L75 185 Z"
      />
    </svg>
  );
}
