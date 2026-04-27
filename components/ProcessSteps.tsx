import { Siren, ScanLine, PencilLine, Layers, type LucideIcon } from 'lucide-react';

type Step = {
  n: number;
  title: string;
  description: string;
  Icon: LucideIcon;
  // Tailwind colour fragments — kept as strings so JIT picks them up.
  iconBg: string;          // rounded square behind the icon
  iconBorder: string;      // ring around the icon square
  iconColor: string;       // the lucide stroke colour
  titleColor: string;      // the step title text colour
  stepLabelColor: string;  // the small "Étape" caption colour
  numberColor: string;     // the giant background watermark digit colour
  topAccent: string;       // soft oval that sits on top of the card
  bottomBar: string;       // gradient bar at the bottom of the card
  shadow: string;          // outer glow shadow
  // On-hover overlay — coloured gradient that fades in the moment the
  // pointer enters the card, so the whole tile briefly takes on the
  // step's theme colour. Reverts smoothly on leave.
  hoverOverlay: string;
  // On-hover border colour, applied via Tailwind's group-hover so the
  // gray-200 resting border re-tints to the step's theme on focus.
  hoverBorder: string;
  // Connector-segment animation (only set on steps 1, 2, 3 — the
  // segment that carries the dot from THIS card to the next).
  travelAnim: string;
  // Static line gradient for the dashed connector (source → target).
  lineFrom: string;
  lineTo: string;
};

const STEPS: Step[] = [
  {
    n: 1,
    title: 'Signalement',
    description: 'Une expérience est signalée par un utilisateur.',
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
    hoverOverlay: 'from-brand-blue/8 via-brand-blue/14 to-brand-blue/22',
    hoverBorder: 'group-hover:border-brand-blue/45',
    travelAnim: 'animate-travel-1-to-2',
    lineFrom: '#0078BA',
    lineTo: '#8652FB',
  },
  {
    n: 2,
    title: 'Examen',
    description: 'Le contenu est vérifié selon les règles de la plateforme.',
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
    hoverOverlay: 'from-violet-500/8 via-violet-500/14 to-violet-500/22',
    hoverBorder: 'group-hover:border-violet-500/45',
    travelAnim: 'animate-travel-2-to-3',
    lineFrom: '#8652FB',
    lineTo: '#F29B11',
  },
  {
    n: 3,
    title: 'Modération',
    description: 'Le contenu peut être ajusté ou refusé si nécessaire.',
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
    hoverOverlay: 'from-orange-500/8 via-orange-500/14 to-orange-500/22',
    hoverBorder: 'group-hover:border-orange-500/45',
    travelAnim: 'animate-travel-3-to-4',
    lineFrom: '#F29B11',
    lineTo: '#22C45E',
  },
  {
    n: 4,
    title: 'Publication',
    description: 'Les contenus conformes sont publiés sur la plateforme.',
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
    hoverOverlay: 'from-green-500/8 via-green-500/14 to-green-500/22',
    hoverBorder: 'group-hover:border-green-500/45',
    travelAnim: '',
    lineFrom: '',
    lineTo: '',
  },
];

export function ProcessSteps() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-6 py-10 md:py-14">
      <h2 className="text-2xl md:text-3xl font-bold bg-grad-stat-navy bg-clip-text text-transparent text-center">
        Processus de vérification des signalements
      </h2>

      <div className="relative mt-10">
        <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const isLast = i === STEPS.length - 1;
            return (
              <div
                key={s.n}
                className={`group relative rounded-3xl bg-white border border-gray-200 ${s.hoverBorder} ${s.shadow} pt-7 px-6 pb-7 overflow-visible transition-all hover:-translate-y-1 hover:shadow-glow-navy duration-300 ease-out`}
              >
                {/* Hover theme overlay — fully transparent at rest, fades
                    in to a soft tint of the step colour the moment the
                    pointer enters. Sits below the card content so text
                    and icons stay perfectly readable, and reverts on
                    leave thanks to the opacity transition. */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br ${s.hoverOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out`}
                />

                {/* Soft coloured oval sitting just above the card top —
                    gives the "step receives the relay" cue from the design. */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 h-3 w-2/3 rounded-full ${s.topAccent} blur-[2px]`}
                />

                {/* Massive watermark digit in the top-right. */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute top-3 right-5 text-7xl md:text-8xl font-extrabold ${s.numberColor} leading-none select-none tracking-tight`}
                >
                  {s.n}
                </span>

                {/* Icon square — light tint of the step colour, soft ring,
                    coloured stroke. Scales gently on card hover. The
                    Lucide icon itself runs `animate-sparkle-pop` on card
                    hover only — same rhythm as the banner pill icon. */}
                <div
                  className={`relative inline-flex items-center justify-center h-12 w-12 rounded-2xl ${s.iconBg} ${s.iconBorder} ${s.iconColor} transition-transform duration-300 ease-out group-hover:scale-110`}
                  aria-hidden
                >
                  <s.Icon className="h-6 w-6 group-hover:animate-sparkle-pop drop-shadow-sm" />
                </div>

                <p
                  className={`relative mt-5 text-xs font-semibold uppercase tracking-[0.2em] ${s.stepLabelColor}`}
                >
                  Étape
                </p>
                <h3 className={`relative mt-1 text-lg md:text-xl font-bold ${s.titleColor}`}>
                  {s.title}
                </h3>
                {/* Description darkens to brand-navy on hover for crisp
                    contrast against the tinted overlay. */}
                <p className="relative mt-2 text-sm text-gray-500 group-hover:text-brand-navy leading-relaxed transition-colors duration-300">
                  {s.description}
                </p>

                {/* Coloured progress bar at the bottom of the card */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute bottom-3 left-6 right-6 h-1 rounded-full ${s.bottomBar}`}
                />

                {/* Connector to the next card — only on lg+, only between
                    cards 1-2-3. The travelling dot uses a per-segment
                    keyframe (travel-1-to-2 / 2-to-3 / 3-to-4) that
                    interpolates background-color and box-shadow so the
                    dot visibly shifts hue mid-flight. */}
                {!isLast && (
                  <div
                    aria-hidden
                    className="hidden lg:block absolute top-12 -right-8 h-0.5 w-8 pointer-events-none"
                  >
                    {/* Dashed line with a left → right colour gradient
                        from this step's colour to the next step's. */}
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

                    {/* Travelling dot — colour-shifts mid-flight. The
                        keyframe sets `left`, `background-color`, `box-
                        shadow`, and `opacity` so the dot fades in,
                        slides across, hue-shifts, and fades out. */}
                    <span
                      className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full ${s.travelAnim}`}
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
