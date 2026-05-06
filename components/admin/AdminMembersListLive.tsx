'use client';

// Admin staff (Membres) — list + create + role/status edit + delete.
// /api/admin/members + /api/admin/members/[id]

import { useState } from 'react';
import {
  Loader2,
  AlertTriangle,
  ShieldCheck,
  ShieldOff,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { useApi } from '@/lib/api/hooks';
import { apiCall, ApiClientError } from '@/lib/api/client';

interface MemberRow {
  id: string;
  role: string;
  status: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  totpEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface Response {
  items: MemberRow[];
}

const ROLE_TINT: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-700',
  ADMIN: 'bg-orange-100 text-orange-700',
  MODERATOR: 'bg-blue-100 text-blue-700',
  SUPPORT: 'bg-gray-100 text-gray-700',
};

export function AdminMembersListLive() {
  const { data, loading, error, refresh } = useApi<Response>(
    '/api/admin/members',
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'MODERATOR' as 'ADMIN' | 'MODERATOR' | 'SUPPORT',
  });

  const create = async () => {
    setCreateError(null);
    setPendingId('__new__');
    try {
      await apiCall('/api/admin/members', { method: 'POST', body: draft });
      setShowCreate(false);
      setDraft({ email: '', password: '', firstName: '', lastName: '', role: 'MODERATOR' });
      await refresh();
    } catch (err) {
      setCreateError(
        err instanceof ApiClientError ? err.userMessage : 'Création impossible.',
      );
    } finally {
      setPendingId(null);
    }
  };

  const updateRole = async (id: string, role: string) => {
    setPendingId(id);
    try {
      await apiCall(`/api/admin/members/${id}`, {
        method: 'PATCH',
        body: { role },
      });
      await refresh();
    } catch (err) {
      window.alert(err instanceof ApiClientError ? err.userMessage : 'Erreur');
    } finally {
      setPendingId(null);
    }
  };

  const remove = async (m: MemberRow) => {
    if (!window.confirm(`Supprimer le compte staff ${m.email} ?`)) return;
    setPendingId(m.id);
    try {
      await apiCall(`/api/admin/members/${m.id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      window.alert(err instanceof ApiClientError ? err.userMessage : 'Erreur');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-navy">Équipe staff</h2>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex items-center gap-2 rounded-pill bg-brand-navy text-white px-4 py-2 text-sm font-semibold hover:bg-brand-blue"
        >
          <UserPlus className="h-4 w-4" />
          Nouveau membre
        </button>
      </div>

      {showCreate && (
        <div className="rounded-2xl bg-brand-sky/30 border border-brand-blue/30 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              placeholder="Email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="password"
              placeholder="Mot de passe (12+ chars)"
              value={draft.password}
              onChange={(e) => setDraft({ ...draft, password: e.target.value })}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Prénom"
              value={draft.firstName}
              onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Nom"
              value={draft.lastName}
              onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <select
              value={draft.role}
              onChange={(e) =>
                setDraft({ ...draft, role: e.target.value as typeof draft.role })
              }
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm col-span-2"
            >
              <option value="ADMIN">Admin</option>
              <option value="MODERATOR">Modérateur</option>
              <option value="SUPPORT">Support</option>
            </select>
          </div>
          {createError && (
            <p className="text-xs text-red-700">{createError}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pendingId === '__new__'}
              onClick={create}
              className="inline-flex items-center gap-1 rounded-pill bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
            >
              {pendingId === '__new__' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" />
              )}
              Créer
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="inline-flex rounded-pill bg-white border border-gray-200 text-brand-navy px-4 py-2 text-sm font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {loading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="inline h-4 w-4 mr-1" />
          {error.userMessage}
        </div>
      )}

      {data && (
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Rôle</th>
                <th className="px-4 py-3 text-left">2FA</th>
                <th className="px-4 py-3 text-left">Dernier login</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((m) => (
                <tr key={m.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 break-all">{m.email}</td>
                  <td className="px-4 py-3">
                    {m.firstName} {m.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={m.role}
                      disabled={pendingId === m.id || m.role === 'SUPER_ADMIN'}
                      onChange={(e) => updateRole(m.id, e.target.value)}
                      className={`text-xs rounded-pill px-2 py-1 font-semibold ${ROLE_TINT[m.role]} disabled:opacity-60`}
                    >
                      <option value="SUPER_ADMIN" disabled>SUPER_ADMIN</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="SUPPORT">SUPPORT</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {m.totpEnabled ? (
                      <span className="text-green-700">
                        <ShieldCheck className="inline h-3 w-3" /> Activé
                      </span>
                    ) : (
                      <span className="text-orange-700">
                        <ShieldOff className="inline h-3 w-3" /> Non enrôlé
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {m.lastLoginAt
                      ? new Date(m.lastLoginAt).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(m)}
                      disabled={pendingId === m.id || m.role === 'SUPER_ADMIN'}
                      className="inline-flex items-center gap-1 rounded-pill bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700 px-2.5 py-1 text-xs font-semibold disabled:opacity-30"
                    >
                      <Trash2 className="h-3 w-3" />
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
