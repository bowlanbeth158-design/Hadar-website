'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, KeyRound, Ban, CheckCircle2, Trash2, Undo2, ChevronDown } from 'lucide-react';

type Status = 'actif' | 'inactif' | 'bloque' | 'supprime';
export type UserAction = 'view' | 'reset' | 'block' | 'unblock' | 'delete' | 'restore';

type Props = {
  status: Status;
  userId: string;
  onAction?: (action: UserAction) => void;
};

export function UserActionsDropdown({ status, userId, onAction }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const isDeleted = status === 'supprime';
  const isBlocked = status === 'bloque';

  type Item = {
    label: string;
    Icon: typeof Eye;
    tone: 'default' | 'warning' | 'success' | 'danger';
    disabled: boolean;
    href?: string;
    action: UserAction;
  };

  const items: Item[] = [
    {
      label: 'Voir le profil',
      Icon: Eye,
      tone: 'default',
      href: `/admin/utilisateurs/${userId}`,
      disabled: false,
      action: 'view',
    },
    {
      label: 'Réinitialiser le mot de passe',
      Icon: KeyRound,
      tone: 'warning',
      disabled: isDeleted,
      action: 'reset',
    },
    isBlocked
      ? { label: 'Débloquer', Icon: CheckCircle2, tone: 'success', disabled: isDeleted, action: 'unblock' }
      : { label: 'Bloquer', Icon: Ban, tone: 'default', disabled: isDeleted, action: 'block' },
    isDeleted
      ? { label: 'Restaurer', Icon: Undo2, tone: 'success', disabled: false, action: 'restore' }
      : { label: 'Supprimer', Icon: Trash2, tone: 'danger', disabled: false, action: 'delete' },
  ];

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-3 py-1.5 text-xs font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
      >
        Actions
        <ChevronDown className="h-3 w-3" aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-white border border-gray-200 shadow-glow-navy overflow-hidden z-20 py-1"
        >
          {items.map((it, i) => {
            const base =
              'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors';
            const toneClass = it.disabled
              ? 'text-gray-300 cursor-not-allowed'
              : it.tone === 'danger'
                ? 'text-red-600 hover:bg-red-50'
                : it.tone === 'success'
                  ? 'text-green-700 hover:bg-green-50'
                  : it.tone === 'warning'
                    ? 'text-orange-600 hover:bg-orange-50'
                    : 'text-brand-navy hover:bg-gray-50';
            const content = (
              <>
                <it.Icon className="h-4 w-4" aria-hidden />
                {it.label}
              </>
            );
            if (it.href && !it.disabled) {
              return (
                <a
                  key={i}
                  href={it.href}
                  role="menuitem"
                  className={`${base} ${toneClass}`}
                  onClick={() => setOpen(false)}
                >
                  {content}
                </a>
              );
            }
            return (
              <button
                key={i}
                type="button"
                role="menuitem"
                disabled={it.disabled}
                onClick={() => {
                  setOpen(false);
                  if (!it.disabled) onAction?.(it.action);
                }}
                className={`${base} ${toneClass}`}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
