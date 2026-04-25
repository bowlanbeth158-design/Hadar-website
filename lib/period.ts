export const PERIOD_LABELS = [
  "Aujourd’hui",
  'Hier',
  '7 jours',
  '30 jours',
  '365 jours',
  'Personnalisé',
] as const;

const PERIOD_MULTIPLIERS: number[] = [1, 0.92, 5.8, 22, 210, 15];

export function periodMultiplier(index: number, rangeDays?: number): number {
  if (index === 5 && rangeDays && rangeDays > 0) {
    return Math.max(1, rangeDays);
  }
  return PERIOD_MULTIPLIERS[index] ?? 1;
}

export function scale(base: number, mult: number, round: 'int' | 'one' = 'int'): number {
  const v = base * mult;
  if (round === 'one') return Math.round(v * 10) / 10;
  return Math.round(v);
}

export function frNumber(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

export function daysBetween(fromISO: string, toISO: string): number {
  if (!fromISO || !toISO) return 0;
  const a = new Date(fromISO).getTime();
  const b = new Date(toISO).getTime();
  const diff = Math.floor((b - a) / 86_400_000) + 1;
  return diff > 0 ? diff : 0;
}

export function relativeNow(secondsAgo: number): string {
  if (secondsAgo < 10) return 'à l’instant';
  if (secondsAgo < 60) return `il y a ${secondsAgo} s`;
  const minutes = Math.floor(secondsAgo / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}
