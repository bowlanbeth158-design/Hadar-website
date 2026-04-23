import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Download,
  FileText,
  Image as ImageIcon,
  Download as DownloadIcon,
} from 'lucide-react';
import { ModerationDecision } from '@/components/admin/ModerationDecision';

type PageProps = { params: { id: string } };

export default function Page({ params }: PageProps) {
  const id = params.id;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/signalements"
            className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 bg-white text-brand-navy px-3.5 py-1.5 text-sm font-medium hover:border-brand-blue transition-all shadow-glow-soft hover:shadow-glow-navy"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Retour
          </Link>
          <nav aria-label="Fil d'ariane" className="text-xs text-gray-400 hidden sm:block">
            <Link href="/admin/signalements" className="hover:text-brand-navy">
              Signalements
            </Link>
            <span className="mx-2">/</span>
            <span className="text-brand-navy font-semibold">#{id}</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-1.5 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Rafraîchir
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-1.5 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
          >
            <Download className="h-4 w-4" aria-hidden />
            Exporter
          </button>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-2">Signalements</h1>

      <div className="flex items-center gap-2 flex-wrap text-sm text-gray-500 mb-8">
        <span className="font-semibold text-brand-navy">#{id} — Signalement</span>
        <span className="text-gray-300">|</span>
        <span className="inline-flex items-center rounded-pill bg-orange-100 text-orange-700 px-2.5 py-0.5 text-xs font-semibold">
          En cours
        </span>
        <span className="text-gray-300">|</span>
        <span>
          ID Utilisateur :{' '}
          <Link href="/admin/utilisateurs/345651" className="text-brand-blue font-semibold hover:underline">
            345 651
          </Link>
        </span>
        <span className="text-gray-300">|</span>
        <span>Date : 13 avril 2026 — 23:12</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <div className="rounded-2xl bg-gray-50 border border-gray-200 shadow-glow-soft p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Infos principales
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Type de contact</dt>
              <dd className="font-semibold text-brand-navy">WhatsApp</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Type de problème</dt>
              <dd className="font-semibold text-brand-navy">Non livraison</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Montant</dt>
              <dd className="font-semibold text-brand-navy">500 MAD</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Contact signalé</dt>
              <dd className="font-mono text-sm text-brand-navy">+212 6 12 34 •• ••</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl bg-gray-50 border border-gray-200 shadow-glow-soft p-5 lg:col-span-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Description
          </h2>
          <div className="text-sm text-brand-navy leading-relaxed max-h-48 overflow-y-auto pr-1">
            <p>
              Paiement effectué le 10/04, aucune réponse depuis. Le vendeur ne répond plus à mes
              messages ni aux appels. Aucune trace d&apos;expédition fournie malgré plusieurs
              relances.
            </p>
            <p className="mt-2">
              J&apos;ai tenté de le contacter via un numéro secondaire, sans succès. Le compte
              semble avoir été supprimé.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-gray-50 border border-gray-200 shadow-glow-soft p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Preuves
          </h2>
          <ul className="space-y-2">
            {[
              { name: 'screenshot-whatsapp-01.png', Icon: ImageIcon },
              { name: 'recu-paiement.pdf', Icon: FileText },
              { name: 'conversation-email.png', Icon: ImageIcon },
            ].map(({ name, Icon }) => (
              <li
                key={name}
                className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <span className="inline-flex items-center gap-2 text-brand-navy min-w-0">
                  <Icon className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
                  <span className="truncate">{name}</span>
                </span>
                <button
                  type="button"
                  aria-label={`Télécharger ${name}`}
                  className="text-gray-400 hover:text-brand-navy shrink-0"
                >
                  <DownloadIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ModerationDecision />
    </div>
  );
}
