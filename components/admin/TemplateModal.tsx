'use client';

import { useEffect, useState } from 'react';
import {
  X,
  FileText,
  Mail,
  MessageCircle,
  Send,
  Save,
  Trash2,
  Eye,
} from 'lucide-react';

export type TemplateChannel = 'email' | 'whatsapp' | 'telegram' | 'banner';
export type TemplateLanguage = 'FR' | 'EN' | 'AR';

export type Template = {
  id: string;
  name: string;
  channel: TemplateChannel;
  language: TemplateLanguage;
  updated: string;
  subject?: string;
  body: string;
};

export type TemplateModalMode = 'create' | 'edit' | 'view';

type Props = {
  open: boolean;
  mode: TemplateModalMode;
  initial?: Partial<Template>;
  onClose: () => void;
  onSave?: (t: Template) => void;
  onDelete?: (id: string) => void;
};

const CHANNEL_META: Record<
  Exclude<TemplateChannel, 'banner'>,
  { Icon: typeof Mail; label: string; color: string }
> = {
  email: { Icon: Mail, label: 'Email', color: 'bg-brand-blue' },
  whatsapp: { Icon: MessageCircle, label: 'WhatsApp', color: 'bg-green-500' },
  telegram: { Icon: Send, label: 'Telegram', color: 'bg-sky-500' },
};

const LANGUAGES: TemplateLanguage[] = ['FR', 'EN', 'AR'];

function todayShort(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
}

export function TemplateModal({ open, mode, initial, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<Exclude<TemplateChannel, 'banner'>>('email');
  const [language, setLanguage] = useState<TemplateLanguage>('FR');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const readOnly = mode === 'view';

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    const initChannel =
      initial?.channel === 'banner' ? 'email' : (initial?.channel as Exclude<TemplateChannel, 'banner'> | undefined) ?? 'email';
    setChannel(initChannel);
    setLanguage((initial?.language as TemplateLanguage | undefined) ?? 'FR');
    setSubject(initial?.subject ?? '');
    setBody(initial?.body ?? '');
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

  const canSubmit = name.trim().length >= 3 && body.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const next: Template = {
      id: initial?.id ?? `tpl-${Date.now()}`,
      name: name.trim(),
      channel,
      language,
      updated: todayShort(),
      subject: channel === 'email' ? subject.trim() : undefined,
      body: body.trim(),
    };
    onSave?.(next);
  };

  const remove = () => {
    if (!initial?.id) return;
    if (!window.confirm(`Supprimer le modèle « ${initial.name ?? ''} » ?`)) return;
    onDelete?.(initial.id);
  };

  const titleByMode =
    mode === 'create'
      ? 'Nouveau modèle'
      : mode === 'edit'
        ? 'Modifier le modèle'
        : 'Aperçu du modèle';

  const meta = CHANNEL_META[channel];

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
              <FileText className="h-5 w-5" aria-hidden />
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
              Nom du modèle
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={readOnly}
              placeholder="Ex : Alerte fraude WhatsApp — v2"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue disabled:bg-gray-50 read-only:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Plateforme
            </label>
            <div className="grid gap-2 sm:grid-cols-3">
              {(['email', 'whatsapp', 'telegram'] as const).map((id) => {
                const on = channel === id;
                const m = CHANNEL_META[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => !readOnly && setChannel(id)}
                    aria-pressed={on}
                    disabled={readOnly}
                    className={
                      on
                        ? 'flex items-center gap-2 rounded-xl border-2 border-brand-blue bg-white p-3 shadow-glow-blue disabled:cursor-not-allowed'
                        : 'flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white p-3 hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed'
                    }
                  >
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-white ${m.color}`}
                    >
                      <m.Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold text-brand-navy">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
              Langue
            </label>
            <div className="flex gap-2">
              {LANGUAGES.map((lg) => {
                const on = language === lg;
                return (
                  <button
                    key={lg}
                    type="button"
                    onClick={() => !readOnly && setLanguage(lg)}
                    aria-pressed={on}
                    disabled={readOnly}
                    className={
                      on
                        ? 'rounded-pill bg-brand-navy text-white px-4 py-1.5 text-xs font-semibold shadow-glow-navy disabled:opacity-80'
                        : 'rounded-pill border border-gray-200 text-brand-navy px-4 py-1.5 text-xs font-medium hover:border-brand-blue disabled:opacity-60 disabled:cursor-not-allowed'
                    }
                  >
                    {lg}
                  </button>
                );
              })}
            </div>
          </div>

          {channel === 'email' && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                Objet (email uniquement)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                readOnly={readOnly}
                placeholder="Ex : Votre signalement a été publié sur Hadar"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue read-only:bg-gray-50"
              />
            </div>
          )}

          <div>
            <label className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
              <span>Contenu du message</span>
              <span className="text-gray-400 font-normal normal-case">
                {body.length} caractère{body.length > 1 ? 's' : ''}
              </span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              readOnly={readOnly}
              rows={8}
              placeholder={`Bonjour {{prenom}},

Nous avons détecté un nouveau signalement concernant...

Restez vigilant.
— L'équipe Hadar.ma`}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-brand-navy focus:outline-none focus:border-brand-blue resize-y font-mono leading-relaxed read-only:bg-gray-50"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              💡 Utilisez <code className="font-mono">{'{{prenom}}'}</code>,{' '}
              <code className="font-mono">{'{{contact}}'}</code>,{' '}
              <code className="font-mono">{'{{lien}}'}</code> comme variables dynamiques.
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Aperçu
            </p>
            <div className="bg-white rounded-lg border border-gray-100 p-3 text-sm text-brand-navy">
              {channel === 'email' && subject && (
                <p className="font-semibold mb-2 pb-2 border-b border-gray-100 text-xs">
                  <span className="text-gray-400">Objet : </span>
                  {subject}
                </p>
              )}
              <div className="inline-flex items-center gap-1.5 mb-2">
                <span className={`inline-flex h-5 w-5 rounded-full text-white items-center justify-center ${meta.color}`}>
                  <meta.Icon className="h-3 w-3" aria-hidden />
                </span>
                <span className="text-[10px] text-gray-500">
                  {meta.label} · {language}
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-xs font-sans leading-relaxed">
                {body || '— Aperçu du contenu apparaîtra ici —'}
              </pre>
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
                {mode === 'create' ? 'Créer le modèle' : 'Enregistrer'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
