'use client';

import { useEffect, useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Pencil,
  Users,
  Check,
  Save,
  ChevronRight,
} from 'lucide-react';
import { GROUP_COLORS, type UserGroup } from '@/lib/groups';

type Mode = 'manage' | 'add';

type Props = {
  open: boolean;
  mode: Mode;
  groups: UserGroup[];
  selectedUserIds?: string[];
  onClose: () => void;
  onCreate: (name: string, description: string, color: string, seedUserIds?: string[]) => void;
  onUpdate: (id: string, patch: Partial<Omit<UserGroup, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  onAddToGroup: (groupId: string, userIds: string[]) => void;
};

export function UserGroupsModal({
  open,
  mode,
  groups,
  selectedUserIds = [],
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  onAddToGroup,
}: Props) {
  const [draftName, setDraftName] = useState('');
  const [draftDesc, setDraftDesc] = useState('');
  const [draftColor, setDraftColor] = useState<string>(GROUP_COLORS[0]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState<string>(GROUP_COLORS[0]);

  useEffect(() => {
    if (!open) return;
    setDraftName('');
    setDraftDesc('');
    setDraftColor(GROUP_COLORS[0]);
    setEditing(null);
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

  const startEdit = (g: UserGroup) => {
    setEditing(g.id);
    setEditName(g.name);
    setEditDesc(g.description ?? '');
    setEditColor(g.color);
  };

  const saveEdit = (id: string) => {
    const n = editName.trim();
    if (!n) return;
    onUpdate(id, { name: n, description: editDesc.trim(), color: editColor });
    setEditing(null);
  };

  const createDraft = () => {
    const n = draftName.trim();
    if (!n) return;
    onCreate(n, draftDesc.trim(), draftColor, mode === 'add' ? selectedUserIds : undefined);
    setDraftName('');
    setDraftDesc('');
  };

  const title =
    mode === 'add'
      ? `Ajouter ${selectedUserIds.length} utilisateur${selectedUserIds.length > 1 ? 's' : ''} à un groupe`
      : 'Groupes d’utilisateurs';

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
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-glow-navy overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-brand-navy text-white">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" aria-hidden />
            <h2 className="text-lg font-bold">{title}</h2>
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

        <div className="flex-1 overflow-y-auto">
          {mode === 'add' && groups.length > 0 && (
            <section className="px-6 pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Groupes existants
              </p>
              <ul className="space-y-2">
                {groups.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => onAddToGroup(g.id, selectedUserIds)}
                      className="w-full flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-brand-blue hover:shadow-glow-soft transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-semibold border ${g.color}`}
                        >
                          {g.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {g.userIds.length} membre{g.userIds.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {mode === 'manage' && (
            <section className="px-6 pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                {groups.length} groupe{groups.length > 1 ? 's' : ''}
              </p>
              {groups.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">
                  Aucun groupe pour l&apos;instant. Créez-en un ci-dessous.
                </p>
              ) : (
                <ul className="space-y-2">
                  {groups.map((g) => {
                    const isEditing = editing === g.id;
                    return (
                      <li
                        key={g.id}
                        className="rounded-xl border border-gray-200 bg-white p-4"
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Nom du groupe"
                              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
                            />
                            <textarea
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              rows={2}
                              placeholder="Description (optionnel)"
                              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue resize-none"
                            />
                            <div className="flex flex-wrap gap-2">
                              {GROUP_COLORS.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setEditColor(c)}
                                  aria-pressed={c === editColor}
                                  className={`h-7 w-7 rounded-full border-2 ${c} ${
                                    c === editColor ? 'ring-2 ring-brand-navy ring-offset-1' : ''
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="inline-flex items-center gap-1 rounded-pill border border-gray-200 text-brand-navy px-3 py-1.5 text-xs font-medium hover:border-brand-blue"
                              >
                                Annuler
                              </button>
                              <button
                                type="button"
                                onClick={() => saveEdit(g.id)}
                                disabled={!editName.trim()}
                                className="inline-flex items-center gap-1 rounded-pill bg-green-500 hover:bg-green-700 text-white px-3 py-1.5 text-xs font-semibold shadow-glow-green disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Save className="h-3.5 w-3.5" aria-hidden />
                                Enregistrer
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-semibold border ${g.color}`}
                                >
                                  {g.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {g.userIds.length} membre{g.userIds.length > 1 ? 's' : ''}
                                </span>
                              </div>
                              {g.description && (
                                <p className="mt-1 text-xs text-gray-500">{g.description}</p>
                              )}
                              <p className="mt-1 text-[10px] text-gray-400">Créé le {g.createdAt}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEdit(g)}
                                aria-label="Modifier"
                                className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-brand-navy"
                              >
                                <Pencil className="h-3.5 w-3.5" aria-hidden />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Supprimer le groupe « ${g.name} » ?`)) {
                                    onDelete(g.id);
                                  }
                                }}
                                aria-label="Supprimer"
                                className="h-8 w-8 rounded-full hover:bg-red-50 flex items-center justify-center text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          <section className="px-6 pt-6 pb-6 bg-gray-50 border-t border-gray-100 mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-3">
              {mode === 'add' ? 'Ou créer un nouveau groupe' : 'Nouveau groupe'}
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Ex : Nouveaux inscrits — Septembre 2026"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
              />
              <textarea
                value={draftDesc}
                onChange={(e) => setDraftDesc(e.target.value)}
                rows={2}
                placeholder="Description (optionnel)"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue resize-none"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Couleur :
                </span>
                {GROUP_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDraftColor(c)}
                    aria-pressed={c === draftColor}
                    className={`h-7 w-7 rounded-full border-2 ${c} ${
                      c === draftColor ? 'ring-2 ring-brand-navy ring-offset-1' : ''
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={createDraft}
                  disabled={!draftName.trim()}
                  className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-2 text-sm font-semibold shadow-glow-navy disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  {mode === 'add' ? 'Créer & ajouter les utilisateurs' : 'Créer le groupe'}
                </button>
              </div>
              {mode === 'add' && (
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Check className="h-3 w-3" aria-hidden />
                  Le groupe sera créé avec les{' '}
                  <strong>
                    {selectedUserIds.length} utilisateur{selectedUserIds.length > 1 ? 's' : ''}
                  </strong>{' '}
                  sélectionné{selectedUserIds.length > 1 ? 's' : ''}.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
