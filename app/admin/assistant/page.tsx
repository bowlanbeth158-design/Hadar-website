'use client';

import { useState } from 'react';
import {
  Search,
  MoreVertical,
  Send,
  Paperclip,
  MessageCircle,
  Bot,
  UserRound,
  Shield,
  Bell,
  Eye,
  Lock,
} from 'lucide-react';
import { RefreshButton } from '@/components/admin/RefreshButton';
import { ExportButton } from '@/components/admin/ExportButton';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { RefreshCw } from 'lucide-react';

type Status = 'ouvert' | 'en_cours' | 'waiting' | 'resolu';
const STATUS_STYLE: Record<Status, { label: string; cls: string }> = {
  ouvert: { label: 'Ouvert', cls: 'bg-brand-sky/70 text-brand-navy' },
  en_cours: { label: 'En cours', cls: 'bg-orange-100 text-orange-700' },
  waiting: { label: 'En attente user', cls: 'bg-gray-100 text-gray-500' },
  resolu: { label: 'Résolu', cls: 'bg-green-100 text-green-700' },
};

type Priority = 'basse' | 'moyenne' | 'haute' | 'urgente';
const PRIORITY_DOT: Record<Priority, string> = {
  basse: 'bg-green-500',
  moyenne: 'bg-gray-400',
  haute: 'bg-orange-500',
  urgente: 'bg-red-500',
};

const CONVERSATIONS: {
  id: string;
  name: string;
  initials: string;
  preview: string;
  status: Status;
  priority: Priority;
  unread: boolean;
  time: string;
  active?: boolean;
}[] = [
  { id: 't1', name: 'Yahya MOUSSAOUI', initials: 'YM', preview: 'Bonjour, mon signalement #2454 est refusé sans explication…', status: 'ouvert', priority: 'haute', unread: true, time: 'il y a 5 min', active: true },
  { id: 't2', name: 'Salma EL AMRANI', initials: 'SA', preview: 'Merci pour votre réponse rapide !', status: 'resolu', priority: 'moyenne', unread: false, time: 'il y a 1 h' },
  { id: 't3', name: 'Karim BENJELLOUN', initials: 'KB', preview: 'Je n’arrive pas à réinitialiser mon mot de passe', status: 'en_cours', priority: 'haute', unread: true, time: 'il y a 2 h' },
  { id: 't4', name: 'Fatima Z.', initials: 'FZ', preview: 'Bonjour, j’ai une question sur la vérification d’un RIB', status: 'waiting', priority: 'basse', unread: false, time: 'il y a 3 h' },
  { id: 't5', name: 'Mehdi TAZI', initials: 'MT', preview: 'Est-ce que mon compte est bloqué ?', status: 'ouvert', priority: 'urgente', unread: true, time: 'il y a 4 h' },
];

const THREAD = [
  { author: 'user' as const, text: 'Bonjour, mon signalement #2454 est refusé sans explication. Pouvez-vous m’aider ?', time: '10:12' },
  { author: 'bot' as const, text: 'Bonjour ! Je transfère votre demande à notre équipe support. Une réponse vous sera donnée sous peu.', time: '10:12' },
  { author: 'member' as const, text: 'Bonjour Yahya, je regarde votre dossier #2454 immédiatement.', time: '10:18' },
  { author: 'note' as const, text: 'Note interne : vérifier les preuves fournies — elles sont partiellement corrompues (PDF illisible).', time: '10:19' },
];

const FILTERS = ['Tous', 'Non assignés', 'Mes tickets', 'Mentions', 'Résolus', 'Archivés'];

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const openCount = CONVERSATIONS.filter((c) => c.status === 'ouvert' || c.status === 'en_cours').length;
  const unreadCount = CONVERSATIONS.filter((c) => c.unread).length;

  const exportRows = (): (string | number)[][] => [
    ['ID', 'Utilisateur', 'Statut', 'Priorité', 'Dernier message', 'Heure'],
    ...CONVERSATIONS.map((c) => [
      c.id,
      c.name,
      STATUS_STYLE[c.status].label,
      c.priority,
      c.preview,
      c.time,
    ]),
  ];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Assistant</h1>
          <p className="mt-1 text-sm text-gray-500">
            <AnimatedCounter key={`${refreshKey}-open`} value={`${openCount}`} /> tickets ouverts
            &middot;{' '}
            <AnimatedCounter key={`${refreshKey}-unread`} value={`${unreadCount}`} /> non lus
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={() => setRefreshKey((k) => k + 1)} />
          <ExportButton filename="hadar-tickets" getRows={exportRows} />
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy text-white px-5 py-2 text-sm font-semibold shadow-glow-navy"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Tickets
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-pill border border-brand-navy text-brand-navy px-5 py-2 text-sm font-medium hover:bg-brand-navy/5 transition-colors"
        >
          <Bot className="h-4 w-4" aria-hidden />
          Chatbot
        </button>
      </nav>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr_320px]">
        <aside className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" aria-hidden />
              <input
                type="search"
                placeholder="Rechercher un ticket…"
                className="w-full rounded-pill bg-gray-50 border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
              />
            </div>
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              {FILTERS.map((f, i) => (
                <button
                  key={f}
                  type="button"
                  className={
                    i === 0
                      ? 'shrink-0 rounded-pill bg-brand-navy text-white px-3 py-1 text-[11px] font-semibold'
                      : 'shrink-0 rounded-pill bg-gray-100 text-gray-500 px-3 py-1 text-[11px] font-medium hover:bg-gray-200'
                  }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {CONVERSATIONS.map((c) => {
              const s = STATUS_STYLE[c.status];
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                      c.active ? 'bg-brand-sky/30' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="relative shrink-0 h-9 w-9 rounded-full bg-grad-stat-navy text-white text-xs font-bold flex items-center justify-center">
                      {c.initials}
                      {c.unread && (
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-brand-navy text-sm truncate">{c.name}</p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{c.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{c.preview}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`inline-flex items-center rounded-pill px-2 py-0.5 text-[10px] font-semibold ${s.cls}`}>
                          {s.label}
                        </span>
                        <span
                          title={`Priorité ${c.priority}`}
                          className={`h-2 w-2 rounded-full ${PRIORITY_DOT[c.priority]}`}
                        />
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft flex flex-col overflow-hidden">
          <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3 min-w-0">
              <span className="h-9 w-9 rounded-full bg-grad-stat-navy text-white text-xs font-bold flex items-center justify-center shrink-0">
                YM
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-brand-navy truncate">Yahya MOUSSAOUI</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center rounded-pill bg-brand-sky/70 text-brand-navy px-2 py-0.5 text-[10px] font-semibold">
                    Ouvert
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-pill bg-orange-100 text-orange-700 px-2 py-0.5 text-[10px] font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    Haute
                  </span>
                </div>
              </div>
            </div>
            <button type="button" aria-label="Actions" className="text-gray-400 hover:text-brand-navy">
              <MoreVertical className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[500px] bg-gray-50/50">
            {THREAD.map((m, i) => {
              if (m.author === 'user') {
                return (
                  <div key={i} className="flex items-end gap-2">
                    <span className="h-6 w-6 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                      YM
                    </span>
                    <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-brand-sky text-brand-navy px-4 py-2 text-sm">
                      <p>{m.text}</p>
                      <p className="mt-1 text-[10px] text-brand-navy/60">{m.time}</p>
                    </div>
                  </div>
                );
              }
              if (m.author === 'bot') {
                return (
                  <div key={i} className="flex items-end gap-2">
                    <span className="h-6 w-6 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center shrink-0">
                      <Bot className="h-3.5 w-3.5" />
                    </span>
                    <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-yellow-100 text-yellow-800 px-4 py-2 text-sm">
                      <p>{m.text}</p>
                      <p className="mt-1 text-[10px] text-yellow-700/60">{m.time}</p>
                    </div>
                  </div>
                );
              }
              if (m.author === 'note') {
                return (
                  <div key={i} className="rounded-xl bg-yellow-100 border border-yellow-200 px-4 py-2 text-sm text-yellow-800 flex items-start gap-2">
                    <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
                    <div>
                      <p className="font-semibold text-[11px] uppercase tracking-wide mb-0.5">
                        Note interne
                      </p>
                      <p>{m.text}</p>
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="flex items-end gap-2 justify-end">
                  <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-brand-navy text-white px-4 py-2 text-sm">
                    <p>{m.text}</p>
                    <p className="mt-1 text-[10px] text-white/70 text-right">{m.time}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-100 p-4 bg-white">
            <textarea
              rows={2}
              placeholder="Votre réponse… Tapez / pour insérer une réponse pré-rédigée."
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue resize-none"
            />
            <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Joindre" className="text-gray-400 hover:text-brand-navy">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-pill bg-yellow-100 text-yellow-700 px-3 py-1.5 text-xs font-semibold hover:bg-yellow-200 transition-colors"
                >
                  <Lock className="h-3.5 w-3.5" aria-hidden />
                  Note interne
                </button>
                <label className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <input type="checkbox" />
                  Marquer comme résolu
                </label>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-pill bg-green-500 hover:bg-green-700 text-white px-5 py-2 text-sm font-semibold shadow-glow-green transition-all"
              >
                <Send className="h-4 w-4" aria-hidden />
                Répondre
              </button>
            </div>
          </div>
        </section>

        <aside className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5 space-y-5">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-grad-stat-navy text-white flex items-center justify-center text-sm font-bold shadow-glow-navy">
              YM
            </div>
            <p className="mt-3 font-semibold text-brand-navy">Yahya MOUSSAOUI</p>
            <p className="text-xs text-gray-500">Utilisateur · Actif</p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
              Contact
            </p>
            <dl className="space-y-1 text-xs text-brand-navy">
              <div className="flex justify-between gap-2"><dt className="text-gray-500">Email</dt><dd className="truncate">yahya.moussaoui@gmail.com</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-gray-500">Téléphone</dt><dd>+212 675 487 955</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-gray-500">Langue</dt><dd>Français</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-gray-500">Inscrit le</dt><dd>13/04/26</dd></div>
            </dl>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Actions rapides
            </p>
            <div className="grid gap-1.5">
              <button type="button" className="inline-flex items-center gap-2 rounded-pill border border-gray-200 text-brand-navy px-3 py-1.5 text-xs font-medium hover:border-brand-blue transition-colors">
                <Eye className="h-3.5 w-3.5" aria-hidden />
                Voir le profil
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-pill border border-gray-200 text-orange-600 px-3 py-1.5 text-xs font-medium hover:bg-orange-50 transition-colors">
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                Réinitialiser le mot de passe
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-pill border border-gray-200 text-red-600 px-3 py-1.5 text-xs font-medium hover:bg-red-50 transition-colors">
                <Shield className="h-3.5 w-3.5" aria-hidden />
                Bloquer
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Historique
            </p>
            <p className="text-xs text-brand-navy">
              <span className="font-semibold">8 tickets précédents</span> · 3 signalements
            </p>
            <p className="mt-2 text-xs text-gray-500">
              SLA :{' '}
              <span className="inline-flex items-center rounded-pill bg-green-100 text-green-700 px-2 py-0.5 text-[10px] font-semibold ml-1">
                <Bell className="h-3 w-3 mr-1" />
                Dans les temps
              </span>
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['modération', 'preuves', 'urgent'].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-pill bg-brand-sky/60 text-brand-navy px-2 py-0.5 text-[10px] font-medium"
                >
                  <UserRound className="h-2.5 w-2.5 mr-1" />
                  {t}
                </span>
              ))}
              <button type="button" className="inline-flex items-center rounded-pill border border-dashed border-gray-300 text-gray-400 px-2 py-0.5 text-[10px] hover:text-brand-navy hover:border-brand-blue transition-colors">
                + Ajouter
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
