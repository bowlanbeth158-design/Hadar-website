'use client';

import { useEffect, useState } from 'react';
import { X, Trash2, CheckCircle2, UserRound, Mail, Phone, ShieldCheck, Clock } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';
import { translateRole, translateMemberStatus } from '@/lib/i18n/helpers';

type Role = 'admin' | 'moderateur' | 'support';
type Status = 'actif' | 'inactif' | 'suspendu';

export type MemberFormValues = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: Status;
  lastSeen?: string;
};

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Partial<MemberFormValues>;
  onClose: () => void;
  onSave?: (values: MemberFormValues) => void;
  onDelete?: (id: string) => void;
};

const ROLES: { id: Role; descKey: string }[] = [
  { id: 'admin', descKey: 'memberModal.role.admin.desc' },
  { id: 'moderateur', descKey: 'memberModal.role.moderateur.desc' },
  { id: 'support', descKey: 'memberModal.role.support.desc' },
];

const STATUSES: { id: Status; cls: string }[] = [
  { id: 'actif', cls: 'text-green-700 bg-green-100 border-green-500' },
  { id: 'inactif', cls: 'text-gray-600 bg-gray-100 border-gray-400' },
  { id: 'suspendu', cls: 'text-red-700 bg-red-100 border-red-500' },
];

export function MemberModal({ open, mode, initial, onClose, onSave, onDelete }: Props) {
  const { t } = useI18n();
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [role, setRole] = useState<Role>(initial?.role ?? 'moderateur');
  const [status, setStatus] = useState<Status>(initial?.status ?? 'actif');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setEmail(initial?.email ?? '');
    setPhone(initial?.phone ?? '');
    setRole(initial?.role ?? 'moderateur');
    setStatus(initial?.status ?? 'actif');
    setSaved(false);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  if (!open) return null;

  const canSubmit = name.trim() && email.trim() && phone.trim();
  const title = mode === 'create' ? t('memberModal.titleCreate') : t('memberModal.titleEdit');

  const submit = () => {
    if (!canSubmit) return;
    onSave?.({
      id: initial?.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      status,
      lastSeen: initial?.lastSeen,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  const remove = () => {
    if (!initial?.id) return;
    if (!window.confirm(t('memberModal.confirmDelete', { name: initial.name ?? '' }))) return;
    onDelete?.(initial.id);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
    >
      <button
        type="button"
        aria-label={t('common.close')}
        onClick={onClose}
        className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm cursor-default"
      />
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-glow-navy overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-brand-navy text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" aria-hidden />
            <h2 id="member-modal-title" className="text-lg font-bold">
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="p-6 bg-brand-sky/30 max-h-[70vh] overflow-y-auto">
          <fieldset>
            <legend className="block text-xs font-semibold uppercase tracking-wide text-brand-navy/60 mb-3">
              {t('memberModal.info')}
            </legend>
            <div className="grid gap-3">
              <label className="block">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-navy mb-1">
                  <UserRound className="h-3.5 w-3.5" aria-hidden />
                  {t('memberModal.fullName')}
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder={t('memberModal.fullNamePlaceholder')}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue bg-white"
                />
              </label>
              <label className="block">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-navy mb-1">
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                  {t('memberModal.phone')}
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  placeholder={t('memberModal.phonePlaceholder')}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue bg-white"
                />
              </label>
              <label className="block">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-navy mb-1">
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                  {t('memberModal.email')}
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder={t('memberModal.emailPlaceholder')}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy focus:outline-none focus:border-brand-blue bg-white"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="block text-xs font-semibold uppercase tracking-wide text-brand-navy/60 mb-3">
              {t('memberModal.role')}
            </legend>
            <div className="space-y-2">
              {ROLES.map((r) => {
                const on = r.id === role;
                return (
                  <label
                    key={r.id}
                    className={`flex items-start gap-3 rounded-xl border-2 bg-white p-3 cursor-pointer transition-all ${
                      on ? 'border-brand-blue shadow-glow-blue' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.id}
                      checked={on}
                      onChange={() => setRole(r.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">{translateRole(t, r.id)}</p>
                      <p className="text-xs text-gray-500">{t(r.descKey)}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="block text-xs font-semibold uppercase tracking-wide text-brand-navy/60 mb-3">
              {t('memberModal.status')}
            </legend>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => {
                const on = s.id === status;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(s.id)}
                    aria-pressed={on}
                    className={
                      on
                        ? `inline-flex items-center gap-2 rounded-pill border-2 ${s.cls} px-4 py-1.5 text-sm font-semibold shadow-glow-soft`
                        : 'inline-flex items-center gap-2 rounded-pill border-2 border-gray-200 bg-white text-gray-500 px-4 py-1.5 text-sm font-medium hover:border-gray-300'
                    }
                  >
                    {translateMemberStatus(t, s.id)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {mode === 'edit' && initial?.lastSeen && (
            <div className="mt-6 rounded-xl bg-white border border-gray-200 p-3 flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {t('memberModal.lastSeen')} :{' '}
              <span className="font-semibold text-brand-navy">{initial.lastSeen}</span>
              {initial.id && (
                <span className="ml-auto text-gray-400 font-mono">ID #{initial.id}</span>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          {mode === 'edit' ? (
            <button
              type="button"
              onClick={remove}
              className="inline-flex items-center gap-1.5 rounded-pill bg-red-500 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold shadow-glow-red transition-all"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              {t('memberModal.delete')}
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
              <X className="h-4 w-4" aria-hidden />
              {t('memberModal.cancel')}
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="inline-flex items-center gap-1.5 rounded-pill bg-green-500 hover:bg-green-700 text-white px-5 py-2 text-sm font-semibold shadow-glow-green disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              {saved
                ? t('memberModal.saved')
                : mode === 'create'
                  ? t('memberModal.create')
                  : t('memberModal.validate')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
