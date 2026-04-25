export type UserGroup = {
  id: string;
  name: string;
  description?: string;
  color: string;
  userIds: string[];
  createdAt: string;
};

export const GROUPS_KEY = 'hadar:user-groups';
export const GROUP_COLORS = [
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
] as const;

export function loadGroups(): UserGroup[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(GROUPS_KEY);
    return raw ? (JSON.parse(raw) as UserGroup[]) : [];
  } catch {
    return [];
  }
}

export function saveGroups(groups: UserGroup[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

export function parseFrDate(d: string): Date | null {
  const [datePart] = d.trim().split(/\s+/);
  if (!datePart) return null;
  const [dd, mm, yy] = datePart.split('/');
  if (!dd || !mm || !yy) return null;
  const year = yy.length === 2 ? 2000 + Number(yy) : Number(yy);
  return new Date(year, Number(mm) - 1, Number(dd));
}

export function signupMonthKey(d: string): string {
  const date = parseFrDate(d);
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

const MONTH_LABELS_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export function monthLabel(key: string): string {
  const [y, m] = key.split('-');
  const mIdx = Number(m) - 1;
  if (!y || mIdx < 0 || mIdx > 11) return key;
  return `${MONTH_LABELS_FR[mIdx]} ${y}`;
}
