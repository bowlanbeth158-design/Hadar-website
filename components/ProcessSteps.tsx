import { Siren, ScanLine, PencilLine, Layers, type LucideIcon } from 'lucide-react';

type Step = {
  n: number;
  title: string;
  description: string;
  Icon: LucideIcon;
  // Tailwind colour fragments — we keep them as strings rather than
  // template-literals so JIT picks them up.
  iconBg: string;          // rounded square behind the icon
  iconBorder: string;      // ring around the icon square
  iconColor: string;       // the lucide stroke colour
  titleColor: string;      // the step title text colour
  stepLabelColor: string;  // the small "Step" caption colour
  numberColor: string;     // the giant background watermark digit colour
  topAccent: string;       // soft oval that sits on top of the card
  bottomBar: string;       // gradient bar at the bottom of the card
  shadow: string;          // outer glow shadow
  dotBg: string;           // travelling dot bg colour for the connector
  dotShadow: string;       // travelling dot glow colour for the connector
  lineFrom: string;        // connector dashed-line gradient start
  lineTo: string;          // connector dashed-line gradient end
};

const STEPS: Step[] = [
  {
    n: 1,
    title: 'Signalement',
    description:
      'Un utilisateur partage un signalement sur un contact ou un moyen de paiement.',
    Icon: Siren,
    iconBg: 'bg-brand-blue/10',
    iconBorder: 'ring-1 ring-brand-blue/20',
    iconColor: 'text-brand-blue',
    titleColor: 'text-brand-blue',
    stepLabelColor: 'text-brand-blue/80',
    numberColor: 'text-brand-blue/10',
    topAccent: 'bg-gradient-to-b from-brand-blue/30 to-transparent',
    bottomBar: 'bg-gradient-to-r from-brand-blue via-brand-blue/50 to-transparent',
    shadow: 'shadow-glow-blue',
    dotBg: 'bg-brand-blue',
    dotShadow: 'rgb(0 120 186 / 0.7)',
    lineFrom: '#0078BA',
    lineTo: '#8652FB',
  },
  {
    n: 2,
    title: 'Examen',
    description: 'Le contenu est examiné selon les règles de la plateforme.',
    Icon: ScanLine,
    iconBg: 'bg-violet-500/10',
    iconBorder: 'ring-1 ring-violet-500/25',
    iconColor: 'text-violet-500',
    titleColor: 'text-violet-500',
    stepLabelColor: 'text-violet-500/80',
    numberColor: 'text-violet-500/10',
    topAccent: 'bg-gradient-to-b from-violet-500/30 to-transparent',
    bottomBar: 'bg-gradient-to-r from-violet-500 via-violet-500/50 to-transparent',
    shadow: 'shadow-glow-violet',
    dotBg: 'bg-violet-500',
    dotShadow: 'rgb(134 82 251 / 0.7)',
    lineFrom: '#8652FB',
    lineTo: '#F29B11',
  },
  {
    n: 3,
    title: 'Modération',
    description: 'Le contenu peut être modifié ou supprimé si nécessaire.',
    Icon: PencilLine,
    iconBg: 'bg-orange-500/10',
    iconBorder: 'ring-1 ring-orange-500/25',
    iconColor: 'text-orange-500',
    titleColor: 'text-orange-500',
    stepLabelColor: 'text-orange-500/80',
    numberColor: 'text-orange-500/10',
    topAccent: 'bg-gradient-to-b from-orange-500/30 to-transparent',
    bottomBar: 'bg-gradient-to-r from-orange-500 via-orange-500/50 to-transparent',
    shadow: 'shadow-glow-orange',
    dotBg: 'bg-orange-500',
    dotShadow: 'rgb(242 155 17 / 0.7)',
    lineFrom: '#F29B11',
    lineTo: '#22C45E',
  },
  {
    n: 4,
    title: 'Publication',
    description: 'Les signalements conformes sont publiés sur la plateforme.',
    Icon: Layers,
    iconBg: 'bg-green-500/10',
    iconBorder: 'ring-1 ring-green-500/25',
    iconColor: 'text-green-500',
    titleColor: 'text-green-500',
    stepLabelColor: 'text-green-500/80',
    numberColor: 'text-green-500/10',
    topAccent: 'bg-gradient-to-b from-green-500/30 to-transparent',
    bottomBar: 'bg-gradient-to-r from-green-500 via-green-500/50 to-transparent',
    shadow: 'shadow-glow-green',
    dotBg: 'bg-green-500',
    dotShadow: 'rgb(34 196 94 / 0.7)',
    lineFrom: '',
    lineTo: '',
  },
];

export function ProcessSteps() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-6 py-10 md:py-14">
      <h2 className="text-2xl md:text-3xl font-bold bg-grad-stat-navy bg-clip-text text-transparent text-center">
        Processus des signalements
      </h2>

      <div className="relative mt-10">
        <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const isLast = i === STEPS.length - 1;
            return (
              <div
                key={s.n}
                className={`relative rounded-3xl bg-white border border-gray-200 ${s.shadow} pt-7 px-6 pb-7 overflow-visible transition-all hover:-translate-y-1 hover:shadow-glow-navy duration-300 ease-out`}
              >
                {/* Soft coloured oval sitting just above the card top —
                    gives the "step receives the relay" cue from the design. */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 h-3 w-2/3 rounded-full ${s.topAccent} blur-[2px]`}
                />

                {/* Massive watermark digit in the top-right */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute top-3 right-5 text-7xl md:text-8xl font-extrabold ${s.numberColor} leading-none select-none tracking-tight`}
                >
                  {s.n}
                </span>

                {/* Icon square — light tint of the step colour, soft ring,
                    coloured stroke. Scales gently on card hover. */}
                <div
                  className={`relative inline-flex items-center justify-center h-12 w-12 rounded-2xl ${s.iconBg} ${s.iconBorder} ${s.iconColor} transition-transform duration-300 ease-out group-hover:scale-105`}
                  aria-hidden
                >
                  <s.Icon className="h-6 w-6" />
                </div>

                <p
                  className={`mt-5 text-xs font-semibold uppercase tracking-[0.2em] ${s.stepLabelColor}`}
                >
                  Step
                </p>
                <h3 className={`mt-1 text-lg md:text-xl font-bold ${s.titleColor}`}>
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{s.description}</p>

                {/* Coloured progress bar at the bottom of the card */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute bottom-3 left-6 right-6 h-1 rounded-full ${s.bottomBar}`}
                />

                {/* Connector to the next card (only on lg+, only between cards 1-2-3) */}
                {!isLast && (
                  <div
                    aria-hidden
                    className="hidden lg:block absolute top-12 -right-8 h-0.5 w-8 pointer-events-none"
                  >
                    {/* Dashed line with a left → right colour gradient
                        from this step's colour to the next step's colour. */}
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${s.lineFrom} 0%, ${s.lineTo} 100%)`,
                        WebkitMaskImage:
                          'repeating-linear-gradient(to right, black 0 4px, transparent 4px 8px)',
                        maskImage:
                          'repeating-linear-gradient(to right, black 0 4px, transparent 4px 8px)',
                        opacity: 0.55,
                      }}
                    />

                    {/* Travelling dot — coloured glow, fades in/out, with
                        a per-segment delay so the three dots relay one
                        after the other (0 s → 1 s → 2 s on a 3 s loop). */}
                    <span
                      className={`absolute top-1/2 h-3 w-3 rounded-full ${s.dotBg} animate-connector-travel`}
                      style={{
                        animationDelay: `${i}s`,
                        boxShadow: `0 0 12px 2px ${s.dotShadow}`,
                      }}
                    />
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
