export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center gap-3 mb-6">
        <div
          aria-hidden
          className="h-12 w-12 rounded-xl bg-grad-stat-navy flex items-center justify-center text-white font-bold text-xl"
        >
          H
        </div>
        <span className="text-3xl font-bold text-brand-navy">Hadar.ma</span>
      </div>

      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-brand-navy max-w-3xl">
        Avant d&apos;acheter, vérifiez.
      </h1>

      <p className="mt-6 max-w-2xl text-gray-500 text-lg">
        Recherchez un numéro, un email, un site web ou un moyen de paiement pour vérifier
        s&apos;il a déjà été signalé.
      </p>

      <div className="mt-10 inline-flex items-center gap-2 rounded-pill bg-brand-sky px-4 py-2 text-sm font-medium text-brand-navy">
        🚧 Plateforme en cours de construction — étape&nbsp;scaffolding
      </div>

      <p className="mt-12 text-xs text-gray-400">
        Restez vigilant avant toute transaction.
      </p>
    </main>
  );
}
