'use client';

import { useState } from 'react';
import { Loader2, AlertTriangle, Save } from 'lucide-react';
import { useApi } from '@/lib/api/hooks';
import { apiCall, ApiClientError } from '@/lib/api/client';

interface Response {
  config: Record<string, unknown>;
}

export function AdminPlatformConfigLive() {
  const { data, loading, error, refresh } = useApi<Response>(
    '/api/admin/platform-config',
  );
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);

  const startEdit = (k: string, v: unknown) => {
    setEditingKey(k);
    setDraft(typeof v === 'string' ? v : JSON.stringify(v, null, 2));
  };

  const save = async () => {
    if (!editingKey) return;
    let value: unknown = draft;
    try {
      value = JSON.parse(draft);
    } catch {
      // Si pas valide JSON, on traite comme string brute.
    }
    setPending(true);
    try {
      await apiCall('/api/admin/platform-config', {
        method: 'POST',
        body: { key: editingKey, value },
      });
      setEditingKey(null);
      await refresh();
    } catch (err) {
      window.alert(
        err instanceof ApiClientError ? err.userMessage : 'Erreur',
      );
    } finally {
      setPending(false);
    }
  };

  if (loading) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />;
  if (error)
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        <AlertTriangle className="inline h-4 w-4 mr-1" />
        {error.userMessage}
      </div>
    );

  const entries = data ? Object.entries(data.config) : [];

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-900">
        ⚠ Édition en JSON brut. Une mauvaise valeur peut casser des
        fonctionnalités. Les modifications sont auditées.
      </div>

      {entries.length === 0 && (
        <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center text-sm text-gray-400">
          Aucune clé de configuration définie.
        </div>
      )}

      {entries.map(([k, v]) => (
        <div key={k} className="rounded-2xl bg-white border border-gray-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-brand-blue">{k}</p>
              {editingKey === k ? (
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono"
                />
              ) : (
                <pre className="mt-2 text-xs text-gray-700 bg-gray-50 rounded p-2 overflow-x-auto">
                  {JSON.stringify(v, null, 2)}
                </pre>
              )}
            </div>
            <div>
              {editingKey === k ? (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={save}
                    disabled={pending}
                    className="inline-flex items-center gap-1 rounded-pill bg-green-600 text-white px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                  >
                    {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingKey(null)}
                    className="inline-flex rounded-pill bg-white border border-gray-200 text-brand-navy px-3 py-1.5 text-xs"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => startEdit(k, v)}
                  className="inline-flex rounded-pill bg-brand-sky/40 text-brand-navy px-3 py-1.5 text-xs font-medium hover:bg-brand-sky/60"
                >
                  Éditer
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
