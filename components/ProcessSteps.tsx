import { Siren, FileSearch, PencilLine, Copy, type LucideIcon } from 'lucide-react';

type Step = {
  n: number;
  title: string;
  description: string;
  Icon: LucideIcon;
  borderTop: string;
  iconColor: string;
  dotColor: string;
};

const STEPS: Step[] = [
  {
    n: 1,
    title: 'Signalement',
    description: 'Un utilisateur partage un signalement sur un contact ou un moyen de paiement.',
    Icon: Siren,
    borderTop: 'border-t-brand-blue',
    iconColor: 'text-brand-blue',
    dotColor: 'bg-brand-blue',
  },
  {
    n: 2,
    title: 'Examen',
    description: 'Le contenu est examiné selon les règles de la plateforme.',
    Icon: FileSearch,
    borderTop: 'border-t-violet-500',
    iconColor: 'text-violet-500',
    dotColor: 'bg-violet-500',
  },
  {
    n: 3,
    title: 'Modération',
    description: 'Le contenu peut être modifié ou supprimé si nécessaire.',
    Icon: PencilLine,
    borderTop: 'border-t-orange-500',
    iconColor: 'text-orange-500',
    dotColor: 'bg-orange-500',
  },
  {
    n: 4,
    title: 'Publication',
    description: 'Les signalements conformes sont publiés sur la plateforme.',
    Icon: Copy,
    borderTop: 'border-t-green-500',
    iconColor: 'text-green-500',
    dotColor: 'bg-green-500',
  },
];

export function ProcessSteps() {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6">
      <h2 className="text-2xl md:text-3xl font-bold bg-grad-stat-navy bg-clip-text text-transparent text-center">
        Processus des signalements
      </h2>

      <div className="relative mt-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const next = STEPS[i + 1];
            return (
              <div
                key={s.n}
                className={`relative rounded-2xl bg-white border border-gray-200 border-t-4 ${s.borderTop} p-6 overflow-visible`}
              >
                <span
                  aria-hidden
                  className="absolute top-3 right-5 text-7xl font-bold text-gray-200 leading-none select-none pointer-events-none"
                >
                  {s.n}
                </span>

                <div
                  className={`inline-flex items-center justify-center h-11 w-11 rounded-xl bg-white border-2 border-gray-100 shadow-sm ${s.iconColor}`}
                  aria-hidden
                >
                  <s.Icon className="h-5 w-5" />
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Step
                </p>
                <h3 className="mt-1 text-lg font-bold text-brand-navy">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{s.description}</p>

                {next && (
                  <div
                    aria-hidden
                    className="hidden lg:flex absolute top-8 -right-6 w-12 items-center pointer-events-none"
                  >
                    <span className="flex-1 border-t-2 border-dashed border-gray-300" />
                    <span className={`h-3 w-3 rounded-full ${next.dotColor} ml-1`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
