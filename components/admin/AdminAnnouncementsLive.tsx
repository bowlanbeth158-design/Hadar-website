'use client';

import { useState } from 'react';
import { Loader2, AlertTriangle, Megaphone, Plus } from 'lucide-react';
import { useApi } from '@/lib/api/hooks';
import { apiCall, ApiClientError } from '@/lib/api/client';

interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  author: {
    id: string;
    pii: { firstName: string; lastName: string } | null;
  };
}

interface Response {
  items: Announcement[];
}

export function AdminAnnouncementsLive() {
  const { data, loading, error, refresh } = useApi<Response>(
    '/api/admin/announcements',
  );
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ title: '', body: '', audience: 'all' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const create = async () => {
    if (draft.title.length < 2 || draft.body.length < 2) {
      setFormError('Titre et message obligatoires.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await apiCall('/api/admin/announcements', {
        method: 'POST',
        body: { ...draft, publishNow: true },
      });
      setShowForm(false);
      setDraft({ title: '', body: '', audience: 'all' });
      await refresh();
    } catch (err) {
      setFormError(
        err instanceof ApiClientError ? err.userMessage : 'Erreur',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-navy">Annonces récentes</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-pill bg-brand-navy text-white px-4 py-2 text-sm font-semibold hover:bg-brand-blue"
        >
          <Plus className="h-4 w-4" />
          Nouvelle annonce
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-brand-sky/30 border border-brand-blue/30 p-4 space-y-3">
          <input
            type="text"
            placeholder="Titre"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Message…"
            rows={4}
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
          <select
            value={draft.audience}
            onChange={(e) => setDraft({ ...draft, audience: e.target.value })}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="all">Tous les utilisateurs</option>
            <option value="verified">Utilisateurs vérifiés</option>
            <option value="staff">Staff uniquement</option>
            <option value="beta">Beta testeurs</option>
          </select>
          {formError && <p className="text-xs text-red-700">{formError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={create}
              disabled={submitting}
              className="inline-flex items-center gap-1 rounded-pill bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Publier
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
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

      {data && data.items.length === 0 && (
        <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center text-sm text-gray-400">
          Aucune annonce pour l&apos;instant.
        </div>
      )}

      {data &&
        data.items.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl bg-white border border-gray-200 p-5 shadow-glow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Megaphone className="h-3.5 w-3.5" />
                  <span>{a.audience}</span>
                  <span>·</span>
                  <span>
                    {a.publishedAt
                      ? new Date(a.publishedAt).toLocaleString('fr-FR')
                      : 'Brouillon'}
                  </span>
                </div>
                <h3 className="mt-1 text-base font-bold text-brand-navy">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {a.body}
                </p>
                {a.author.pii && (
                  <p className="mt-2 text-[11px] text-gray-400">
                    par {a.author.pii.firstName} {a.author.pii.lastName}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
