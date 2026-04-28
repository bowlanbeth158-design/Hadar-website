'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'hadar:follows';

type FollowedContact = {
  contactValue: string;
  contactType: string;
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

/**
 * Per-(contact, type) follow state with localStorage persistence.
 * Keeps the popover / list / search-result UI consistent on demo:
 * the same contact key is followed across views, and the toggle
 * survives page reloads. Replace with /api/follows once the
 * backend lands.
 */
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

  const toggle = () => {
    if (!contactValue) return;
    const list = readAll();
    const exists = list.some(
      (x) => x.contactValue === contactValue && x.contactType === contactType,
    );
    const next = exists
      ? list.filter(
          (x) => !(x.contactValue === contactValue && x.contactType === contactType),
        )
      : [...list, { contactValue, contactType }];
    writeAll(next);
    setFollowed(!exists);
  };

  return { followed, toggle, hydrated };
}
