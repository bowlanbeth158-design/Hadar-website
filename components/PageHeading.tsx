type Props = {
  title: string;
  subtitle?: string;
  accent?: 'navy' | 'red';
};

export function PageHeading({ title, subtitle, accent = 'navy' }: Props) {
  const colorClass = accent === 'red' ? 'text-red-500' : 'text-brand-navy';
  return (
    <div className="text-center mb-10 md:mb-14">
      <h1 className={`text-3xl md:text-5xl font-bold tracking-tight ${colorClass}`}>{title}</h1>
      {subtitle && (
        <p className="mt-3 mx-auto max-w-2xl text-base md:text-lg text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}
