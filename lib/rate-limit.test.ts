import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  resetRateLimit,
  _resetStoreForTest,
  _setStoreForTest,
  type RateLimitStore,
} from './rate-limit';

beforeEach(() => {
  _resetStoreForTest();
});

describe('checkRateLimit (sliding window in-memory)', () => {
  it('laisse passer dans la limite', async () => {
    const r1 = await checkRateLimit({ key: 't1', max: 3, windowMs: 1000 });
    expect(r1.ok).toBe(true);
    expect(r1.remaining).toBe(2);
    const r2 = await checkRateLimit({ key: 't1', max: 3, windowMs: 1000 });
    expect(r2.ok).toBe(true);
    expect(r2.remaining).toBe(1);
    const r3 = await checkRateLimit({ key: 't1', max: 3, windowMs: 1000 });
    expect(r3.ok).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('bloque au-delà de la limite', async () => {
    for (let i = 0; i < 3; i++) {
      await checkRateLimit({ key: 't2', max: 3, windowMs: 1000 });
    }
    const blocked = await checkRateLimit({ key: 't2', max: 3, windowMs: 1000 });
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it('isolation par clé', async () => {
    for (let i = 0; i < 3; i++) {
      await checkRateLimit({ key: 'a', max: 3, windowMs: 1000 });
    }
    const blockedA = await checkRateLimit({ key: 'a', max: 3, windowMs: 1000 });
    expect(blockedA.ok).toBe(false);
    const okB = await checkRateLimit({ key: 'b', max: 3, windowMs: 1000 });
    expect(okB.ok).toBe(true);
  });

  it('reset libère le compteur', async () => {
    for (let i = 0; i < 3; i++) {
      await checkRateLimit({ key: 't3', max: 3, windowMs: 1000 });
    }
    expect((await checkRateLimit({ key: 't3', max: 3, windowMs: 1000 })).ok).toBe(false);
    await resetRateLimit('t3');
    expect((await checkRateLimit({ key: 't3', max: 3, windowMs: 1000 })).ok).toBe(true);
  });

  it('fail-open si le store throw', async () => {
    const failingStore: RateLimitStore = {
      recordAndCount: async () => {
        throw new Error('store down');
      },
      reset: async () => {
        /* noop */
      },
    };
    _setStoreForTest(failingStore);
    const r = await checkRateLimit({ key: 'x', max: 1, windowMs: 1000 });
    expect(r.ok).toBe(true);
  });
});
