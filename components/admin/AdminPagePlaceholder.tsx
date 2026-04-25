import { Construction, type LucideIcon } from 'lucide-react';

type Props = {
  title: string;
  subtitle?: string;
  Icon?: LucideIcon;
  bullets?: string[];
};

export function AdminPagePlaceholder({ title, subtitle, Icon = Construction, bullets = [] }: Props) {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-2">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mb-8">{subtitle}</p>}

      <div className="rounded-2xl bg-white border-2 border-dashed border-gray-200 p-10 text-center">
        <Icon className="mx-auto h-12 w-12 text-brand-navy mb-4" aria-hidden />
        <p className="text-lg font-semibold text-brand-navy">En cours d&apos;intégration</p>
        <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">
          Cette section fait partie du back-office Hadar et sera activée lors de la bascule vers
          le serveur de production. La structure visible ici suit la spec détaillée dans{' '}
          <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">design/admin-notes.md</code>.
        </p>

        {bullets.length > 0 && (
          <ul className="mt-6 max-w-xl mx-auto text-left space-y-2 text-sm text-gray-600">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-blue shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
