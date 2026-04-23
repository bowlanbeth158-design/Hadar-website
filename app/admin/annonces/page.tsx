import type { Metadata } from 'next';
import {
  Megaphone,
  Mail,
  MessageCircle,
  Send,
  Layers,
  FileText,
  Plug,
  ScrollText,
  MoreVertical,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Annonces' };

const TABS = [
  { id: 'campagnes', label: 'Campagnes', Icon: Megaphone },
  { id: 'automations', label: 'Automations', Icon: Layers },
  { id: 'templates', label: 'Templates', Icon: FileText },
  { id: 'integrations', label: 'Intégrations', Icon: Plug },
  { id: 'logs', label: 'Logs & Audit', Icon: ScrollText },
];

type Status = 'brouillon' | 'planifiee' | 'en_cours' | 'envoyee' | 'echec';
const STATUS: Record<Status, { label: string; cls: string }> = {
  brouillon: { label: 'Brouillon', cls: 'bg-gray-100 text-gray-600' },
  planifiee: { label: 'Planifiée', cls: 'bg-brand-sky/70 text-brand-navy' },
  en_cours: { label: 'En cours', cls: 'bg-orange-100 text-orange-700' },
  envoyee: { label: 'Envoyée', cls: 'bg-green-100 text-green-700' },
  echec: { label: 'Échec', cls: 'bg-red-100 text-red-700' },
};

const CAMPAIGNS: {
  name: string;
  channels: string[];
  status: Status;
  audience: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  scheduled: string;
}[] = [
  { name: 'Lancement Hadar — vague 1', channels: ['email', 'whatsapp'], status: 'envoyee', audience: '8 500 users', sent: 8500, delivered: 8390, opened: 3420, clicked: 930, scheduled: '22/04/26 14:32' },
  { name: 'Rappel vigilance fin de mois', channels: ['email'], status: 'planifiee', audience: 'Actifs 30j · 6 120', sent: 0, delivered: 0, opened: 0, clicked: 0, scheduled: '30/04/26 09:00' },
  { name: 'Mise à jour règles publication', channels: ['email', 'banner'], status: 'brouillon', audience: 'Tous', sent: 0, delivered: 0, opened: 0, clicked: 0, scheduled: '—' },
  { name: 'Alerte risque élevé — segment surveillé', channels: ['whatsapp'], status: 'en_cours', audience: 'Users à haut risque · 312', sent: 180, delivered: 172, opened: 98, clicked: 41, scheduled: 'Maintenant' },
];

const AUTOMATIONS = [
  { name: 'Bienvenue + vérif email', trigger: 'user.created', channels: ['email'], active: true },
  { name: 'Confirmation publication', trigger: 'report.published', channels: ['email', 'banner'], active: true },
  { name: 'Notif refus + motif', trigger: 'report.rejected', channels: ['email'], active: true },
  { name: 'Demande correction + motif', trigger: 'report.needsCorrection', channels: ['email', 'banner'], active: true },
  { name: 'Alerte sécurité connexion inhabituelle', trigger: 'login.unusual', channels: ['email'], active: false },
];

function ChannelPills({ channels }: { channels: string[] }) {
  const map: Record<string, { Icon: React.ComponentType<{ className?: string }>; cls: string; label: string }> = {
    email: { Icon: Mail, cls: 'bg-blue-100 text-blue-700', label: 'Email' },
    whatsapp: { Icon: MessageCircle, cls: 'bg-green-100 text-green-700', label: 'WhatsApp' },
    banner: { Icon: Megaphone, cls: 'bg-orange-100 text-orange-700', label: 'Bandeau' },
  };
  return (
    <div className="flex items-center gap-1">
      {channels.map((c) => {
        const m = map[c];
        if (!m) return null;
        const Icon = m.Icon;
        return (
          <span
            key={c}
            title={m.label}
            className={`inline-flex items-center gap-1 rounded-pill ${m.cls} px-2 py-0.5 text-[10px] font-semibold`}
          >
            <Icon className="h-3 w-3" />
            {m.label}
          </span>
        );
      })}
    </div>
  );
}

export default function Page() {
  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Annonces</h1>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-5 py-2 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
        >
          <Send className="h-4 w-4" aria-hidden />
          Nouvelle campagne
        </button>
      </div>

      <nav className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-3">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={
              i === 0
                ? 'inline-flex items-center gap-1.5 rounded-pill bg-brand-navy text-white px-4 py-1.5 text-sm font-semibold shadow-glow-navy'
                : 'inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-4 py-1.5 text-sm font-medium hover:border-brand-blue transition-colors'
            }
          >
            <t.Icon className="h-3.5 w-3.5" aria-hidden />
            {t.label}
          </button>
        ))}
      </nav>

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft overflow-hidden mb-8">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-brand-navy">Campagnes récentes</h2>
          <span className="text-xs text-gray-500">{CAMPAIGNS.length} campagnes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Nom</th>
                <th className="px-4 py-3 text-left font-semibold">Canaux</th>
                <th className="px-4 py-3 text-left font-semibold">Statut</th>
                <th className="px-4 py-3 text-left font-semibold">Audience</th>
                <th className="px-4 py-3 text-right font-semibold">Env.</th>
                <th className="px-4 py-3 text-right font-semibold">Délivr.</th>
                <th className="px-4 py-3 text-right font-semibold">Ouv.</th>
                <th className="px-4 py-3 text-right font-semibold">Clics</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-right font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {CAMPAIGNS.map((c) => {
                const s = STATUS[c.status];
                return (
                  <tr key={c.name} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-semibold text-brand-navy">{c.name}</td>
                    <td className="px-4 py-3">
                      <ChannelPills channels={c.channels} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.audience}</td>
                    <td className="px-4 py-3 text-right text-brand-navy font-semibold">{c.sent.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{c.delivered.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{c.opened.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{c.clicked.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{c.scheduled}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" aria-label="Actions" className="text-gray-400 hover:text-brand-navy">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="text-lg font-bold text-brand-navy">Automations actives</h2>
          <span className="text-xs text-gray-500">5 automations</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {AUTOMATIONS.map((a) => (
            <div
              key={a.name}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-glow-soft hover:shadow-glow-navy transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-semibold text-brand-navy">{a.name}</p>
                <span
                  className={
                    a.active
                      ? 'inline-flex items-center rounded-pill bg-green-100 text-green-700 px-2.5 py-0.5 text-[11px] font-semibold'
                      : 'inline-flex items-center rounded-pill bg-gray-100 text-gray-500 px-2.5 py-0.5 text-[11px] font-semibold'
                  }
                >
                  {a.active ? 'Actif' : 'En pause'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Déclencheur :{' '}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px]">
                  {a.trigger}
                </code>
              </p>
              <div className="mt-3">
                <ChannelPills channels={a.channels} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
