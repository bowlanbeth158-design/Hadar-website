'use client';

import { useEffect, useState } from 'react';
import {
  X,
  Layers,
  Mail,
  MessageCircle,
  Send,
  Megaphone,
  Save,
  Trash2,
  Eye,
  Zap,
} from 'lucide-react';

export type AutomationChannel = 'email' | 'whatsapp' | 'telegram' | 'banner';

export type Automation = {
  id: string;
  name: string;
  trigger: string;
  channels: AutomationChannel[];
  active: boolean;
};

export type AutomationModalMode = 'create' | 'edit' | 'view';

type Props = {
  open: boolean;
  mode: AutomationModalMode;
  initial?: Partial<Automation>;
  onClose: () => void;
  onSave?: (a: Automation) => void;
  onDelete?: (id: string) => void;
};

export const AUTOMATION_TRIGGERS: { id: string; label: string; desc: string }[] = [
  { id: 'user.created', label: 'user.created', desc: 'Nouvel utilisateur inscrit' },
  { id: 'user.blocked', label: 'user.blocked', desc: 'Utilisateur bloqué' },
  { id: 'user.deleted', label: 'user.deleted', desc: 'Utilisateur supprimé' },
  { id: 'user.restored', label: 'user.restored', desc: 'Utilisateur restauré' },
  { id: 'report.submitted', label: 'report.submitted', desc: 'Nouveau signalement soumis' },
  { id: 'report.published', label: 'report.published', desc: 'Signalement publié' },
  { id: 'report.rejected', label: 'report.rejected', desc: 'Signalement refusé (motif requis)' },
  { id: 'report.needsCorrection', label: 'report.needsCorrection', desc: 'Correction demandée' },
  { id: 'login.unusual', label: 'login.unusual', desc: 'Connexion depuis un lieu inhabituel' },
  { id: 'password.reset', label: 'password.reset', desc: 'Mot de passe réinitialisé' },
  { id: 'contact.riskEscalated', label: 'contact.riskEscalated', desc: 'Risque d’un contact suivi augmenté' },
];

const CHANNEL_META: Record<
  AutomationChannel,
  { Icon: typeof Mail; label: string; color: string }
> = {
  email: { Icon: Mail, label: 'Email', color: 'bg-brand-blue' },
  whatsapp: { Icon: MessageCircle, label: 'WhatsApp', color: 'bg-green-500' },
  telegram: { Icon: Send, label: 'Telegram', color: 'bg-sky-500' },
  banner: { Icon: Megaphone, label: 'Bandeau in-app', color: 'bg-orange-500' },
};

const CHANNELS: AutomationChannel[] = ['email', 'whatsapp', 'telegram', 'banner'];

export function AutomationModal({ open, mode, initial, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState<string>('user.created');
  const [channels, setChannels] = useState<AutomationChannel[]>(['email']);
  const [active, setActive] = useState(true);

  const readOnly = mode === 'view';

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setTrigger(initial?.trigger ?? 'user.created');
    setChannels((initial?.channels as AutomationChannel[] | undefined) ?? ['email']);
    setActive(initial?.active ?? true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onEsc);
    };
  }, [open, initial, onClose]);

  if (!open) return null;

  const canSubmit = name.trim().length >= 3 && channels.length > 0 && trigger.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const next: Automation = {
      id: initial?.id ?? `auto-${Date.now()}`,
      name: name.trim(),
      trigger,
      channels,
      active,
    };
    onSave?.(next);
  };

  const remove = () => {
    if (!initial?.id) return;
    if (!window.confirm(`Supprimer l’automation « ${initial.name ?? ''} » ?`)) return;
    onDelete?.(initial.id);
  };

  const titleByMode =
    mode === 'create'
      ? 'Nouvelle automation'
      : mode === 'edit'
        ? 'Modifier l’automation'
        : 'Aperçu de l’automation';

  const selectedTrigger = AUTOMATION_TRIGGERS.find((t) => t.id === trigger);

  const toggleChannel = (c: AutomationChannel) => {
    if (readOnly) return;
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm cursor-default"
      />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-glow-navy overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-brand-navy text-white">
          <div className="flex items-center gap-2">
            {mode === 'view' ? (
              <Eye className="h-5 w-5" aria-hidden />
            ) : (
              <Layers className="h-5 w-5" aria-hidden />
            )}
            <h2 className="text-lg font-bold">{titleByMode}</h2>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
              Nom de l&apos;automation
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={readOnly}
              placeholder="Ex : Bienvenue + vérif email"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue read-only:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
              <Zap className="inline h-3 w-3 mr-1" aria-hidden />
              Déclencheur (event)
            </label>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              disabled={readOnly}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-brand-navy font-mono focus:outline-none focus:border-brand-blue cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              {AUTOMATION_TRIGGERS.map((tr) => (
                <option key={tr.id} value={tr.id}>
                  {tr.label} — {tr.desc}
                </option>
              ))}
            </select>
            {selectedTrigger && (
              <p className="mt-1 text-[11px] text-gray-500">
                L&apos;automation s&apos;exécute automatiquement quand{' '}
                <span className="italic">{selectedTrigger.desc.toLowerCase()}</span>.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Canaux d&apos;envoi
              <span className="ml-1 text-gray-400 font-normal normal-case">(cochez un ou plusieurs)</span>
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {CHANNELS.map((c) => {
                const on = channels.includes(c);
                const m = CHANNEL_META[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleChannel(c)}
                    aria-pressed={on}
                    disabled={readOnly}
                    className={
                      on
                        ? 'flex items-center gap-2 rounded-xl border-2 border-brand-blue bg-brand-sky/30 p-3 disabled:cursor-not-allowed'
                        : 'flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white p-3 hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed'
                    }
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-white ${m.color}`}
                    >
                      <m.Icon className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold text-brand-navy flex-1 text-left">
                      {m.label}
                    </span>
                    {on && <span className="text-brand-blue text-xs font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-brand-navy">
                Statut : {active ? 'Active' : 'En pause'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {active
                  ? 'L’automation se déclenche dès que l’event arrive.'
                  : 'L’event sera ignoré tant que vous n’activez pas.'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => !readOnly && setActive(!active)}
              disabled={readOnly}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                active ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  active ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Résumé
            </p>
            <div className="bg-white rounded-lg border border-gray-100 p-3 text-xs text-brand-navy space-y-2">
              <p>
                <span className="text-gray-400">Quand</span>{' '}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px]">
                  {trigger}
                </code>{' '}
                <span className="text-gray-400">→ envoie via</span>
              </p>
              <div className="flex flex-wrap gap-1">
                {channels.length === 0 ? (
                  <span className="text-gray-400 text-[11px]">
                    (aucun canal sélectionné)
                  </span>
                ) : (
                  channels.map((c) => {
                    const m = CHANNEL_META[c];
                    return (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 rounded-pill bg-white border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-brand-navy"
                      >
                        <span
                          className={`inline-flex h-3 w-3 rounded-full items-center justify-center ${m.color}`}
                        />
                        {m.label}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          {mode === 'edit' && initial?.id ? (
            <button
              type="button"
              onClick={remove}
              className="inline-flex items-center gap-1.5 rounded-pill bg-red-500 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold shadow-glow-red transition-all"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Supprimer
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 bg-white text-brand-navy px-4 py-2 text-sm font-medium hover:border-brand-blue transition-colors"
            >
              {readOnly ? 'Fermer' : 'Annuler'}
            </button>
            {!readOnly && (
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className="inline-flex items-center gap-1.5 rounded-pill bg-green-500 hover:bg-green-700 text-white px-5 py-2 text-sm font-semibold shadow-glow-green disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Save className="h-4 w-4" aria-hidden />
                {mode === 'create' ? 'Créer l’automation' : 'Enregistrer'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
