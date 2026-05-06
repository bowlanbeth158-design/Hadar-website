'use client';

// ─────────────────────────────────────────────────────────────────────────────
// useFollowContact — toggle de suivi d'un contact.
//
// Quand l'utilisateur est connecté → POST /api/alerts ou DELETE
// /api/alerts/[id] côté serveur. Pour les visiteurs anonymes, on
// conserve le legacy localStorage pour ne pas casser l'UX (la liste
// "Mes suivis" reste accessible sans compte).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { apiCall, ApiClientError } from './api/client';

const STORAGE_KEY = 'hadar:follows';

type FollowedContact = {
  contactValue: string;
  contactType: string;
  /// Présent si la souscription est synchronisée serveur (alertId).
  alertId?: string;
};

function readAll(): FollowedContact[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x) => x && typeof x.contactValue === 'string' && typeof x.contactType === 'string',
    );
  } catch {
    return [];
  }
}

function writeAll(list: FollowedContact[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota errors silently in demo mode
  }
}

const CHANNEL_UI_TO_API: Record<string, string> = {
  telephone: 'TELEPHONE',
  whatsapp: 'WHATSAPP',
  email: 'EMAIL',
  rib: 'RIB',
  site_web: 'SITE_WEB',
  reseaux_sociaux: 'RESEAUX_SOCIAUX',
  paypal: 'PAYPAL',
  binance: 'BINANCE',
};

export function useFollowContact(contactValue: string, contactType: string) {
  const [followed, setFollowed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!contactValue) return;
    const list = readAll();
    setFollowed(
      list.some(
        (x) => x.contactValue === contactValue && x.contactType === contactType,
      ),
    );
    setHydrated(true);
  }, [contactValue, contactType]);

  const toggle = async () => {
    if (!contactValue) return;
    const list = readAll();
    const idx = list.findIndex(
      (x) => x.contactValue === contactValue && x.contactType === contactType,
    );
    const channel = CHANNEL_UI_TO_API[contactType];

    if (idx >= 0) {
      // Désabonnement
      const existing = list[idx]!;
      if (existing.alertId) {
        try {
          await apiCall(`/api/alerts/${existing.alertId}`, { method: 'DELETE' });
        } catch (err) {
          // Si on n'est pas authed, on supprime quand même localement.
          if (!(err instanceof ApiClientError) || err.code !== 'UNAUTHORIZED') {
            // Erreur autre → on tente quand même de garder cohérent côté UI.
          }
        }
      }
      const next = list.filter((_, i) => i !== idx);
      writeAll(next);
      setFollowed(false);
      return;
    }

    // Abonnement
    let alertId: string | undefined;
    if (channel) {
      try {
        const res = await apiCall<{ alertId: string }>('/api/alerts', {
          method: 'POST',
          body: { channel, contactValue },
        });
        alertId = res.alertId;
      } catch {
        // Pas authed ou erreur réseau : on stocke en localStorage seul.
      }
    }
    const next: FollowedContact[] = [
      ...list,
      { contactValue, contactType, alertId },
    ];
    writeAll(next);
    setFollowed(true);
  };

  return { followed, toggle, hydrated };
}
