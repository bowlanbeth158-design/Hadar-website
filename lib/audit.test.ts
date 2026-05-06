import { describe, it, expect } from 'vitest';
import { _internal } from './audit';

const { computeHash, genesis } = _internal;

describe('audit hash chain', () => {
  it('genesis() est déterministe', () => {
    expect(genesis()).toBe(genesis());
    expect(genesis()).toMatch(/^[0-9a-f]{64}$/);
  });

  it('computeHash() est déterministe sur les mêmes inputs', () => {
    const date = new Date('2026-05-06T12:00:00Z');
    const entry = {
      actorType: 'MEMBER' as const,
      actorId: 'mbr_1',
      action: 'report.publish',
      targetType: 'report',
      targetId: 'rep_42',
    };
    const a = computeHash(entry, genesis(), date);
    const b = computeHash(entry, genesis(), date);
    expect(a).toBe(b);
  });

  it('computeHash() change si actorId change', () => {
    const date = new Date('2026-05-06T12:00:00Z');
    const a = computeHash(
      { actorType: 'MEMBER', actorId: 'mbr_1', action: 'x' },
      genesis(),
      date,
    );
    const b = computeHash(
      { actorType: 'MEMBER', actorId: 'mbr_2', action: 'x' },
      genesis(),
      date,
    );
    expect(a).not.toBe(b);
  });

  it('computeHash() change si action change', () => {
    const date = new Date('2026-05-06T12:00:00Z');
    const a = computeHash(
      { actorType: 'MEMBER', actorId: 'mbr_1', action: 'x' },
      genesis(),
      date,
    );
    const b = computeHash(
      { actorType: 'MEMBER', actorId: 'mbr_1', action: 'y' },
      genesis(),
      date,
    );
    expect(a).not.toBe(b);
  });

  it('computeHash() change si prevHash change (chaînage effectif)', () => {
    const date = new Date('2026-05-06T12:00:00Z');
    const entry = {
      actorType: 'MEMBER' as const,
      actorId: 'mbr_1',
      action: 'x',
    };
    const a = computeHash(entry, genesis(), date);
    const b = computeHash(entry, 'a'.repeat(64), date);
    expect(a).not.toBe(b);
  });

  it('computeHash() distingue (a|b) de (ab) — séparateur efficace', () => {
    const date = new Date('2026-05-06T12:00:00Z');
    const a = computeHash(
      { actorType: 'MEMBER', actorId: 'a', action: 'b' },
      genesis(),
      date,
    );
    const b = computeHash(
      { actorType: 'MEMBER', actorId: 'ab', action: '' },
      genesis(),
      date,
    );
    expect(a).not.toBe(b);
  });
});
