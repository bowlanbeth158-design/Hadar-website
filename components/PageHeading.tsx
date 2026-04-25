type Props = {
  title: string;
  subtitle?: string;
  accent?: 'navy' | 'red' | 'gradient';
};

export function PageHeading({ title, subtitle, accent = 'navy' }: Props) {
  const titleClass =
    accent === 'red'
      ? 'text-red-500'
      : accent === 'gradient'
        ? 'bg-grad-stat-navy bg-clip-text text-transparent'
        : 'text-brand-navy';
  return (
    <div className="text-center mb-10 md:mb-14">
      <h1
        className={`text-3xl md:text-5xl font-bold tracking-tight ${titleClass}`}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 mx-auto max-w-2xl text-base md:text-lg text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}
