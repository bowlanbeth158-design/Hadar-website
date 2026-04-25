type Props = {
  title: string;
  subtitle?: string;
  accent?: 'navy' | 'red' | 'gradient';
  align?: 'center' | 'left';
};

export function PageHeading({ title, subtitle, accent = 'navy', align = 'center' }: Props) {
  const titleClass =
    accent === 'red'
      ? 'text-red-500'
      : accent === 'gradient'
        ? 'bg-grad-stat-navy bg-clip-text text-transparent'
        : 'text-brand-navy';
  const isLeft = align === 'left';
  return (
    <div className={`mb-10 md:mb-14 ${isLeft ? 'text-left' : 'text-center'}`}>
      <h1
        className={`text-3xl md:text-5xl font-bold tracking-tight ${titleClass}`}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className={`mt-3 text-base md:text-lg text-gray-500 ${isLeft ? '' : 'max-w-2xl mx-auto'}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
