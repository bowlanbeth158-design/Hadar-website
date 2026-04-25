type Props = {
  variant?: 'color' | 'white';
  withWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const SIZE_MAP = {
  sm: { shield: 'h-8 w-8', text: 'text-xl', gap: 'gap-2' },
  md: { shield: 'h-10 w-10', text: 'text-2xl', gap: 'gap-2.5' },
  lg: { shield: 'h-14 w-14', text: 'text-4xl', gap: 'gap-3' },
} as const;

export function Logo({ variant = 'color', withWordmark = true, size = 'md' }: Props) {
  const s = SIZE_MAP[size];
  const wordmarkColor = variant === 'white' ? 'text-white' : 'text-brand-navy';

  return (
    <div className={`flex items-center ${s.gap}`}>
      <div
        aria-hidden
        className={`${s.shield} rounded-xl bg-grad-stat-navy flex items-center justify-center text-white font-bold`}
      >
        <span className={size === 'lg' ? 'text-2xl' : 'text-lg'}>H</span>
      </div>
      {withWordmark && (
        <span className={`${s.text} font-bold ${wordmarkColor} tracking-tight`}>
          Hadar<span className="opacity-70">.ma</span>
        </span>
      )}
    </div>
  );
}
