import { describe, it, expect } from 'vitest';
import { detectUnsafeContent, normalizeText } from './moderationWords';

describe('normalizeText', () => {
  it('lowercases, strips accents and collapses repeats', () => {
    expect(normalizeText('Éscrôc')).toBe('escroc');
    expect(normalizeText('SCAMMMMER')).toBe('scammer');
    expect(normalizeText('voooleur')).toBe('vooleur');
  });

  it('replaces punctuation with single spaces', () => {
    expect(normalizeText("c'est, un escroc!!")).toBe('c est un escroc');
  });

  it('preserves Arabic characters', () => {
    expect(normalizeText('هذا نصاب')).toBe('هذا نصاب');
  });
});

describe('detectUnsafeContent', () => {
  it('flags darija leetspeak in mid-sentence (the spec example)', () => {
    const r = detectUnsafeContent('rah hada nsab 3lia');
    expect(r.blocked).toBe(true);
    expect(r.matchedWords).toContain('nsab');
  });

  it('flags darija "chafar"', () => {
    const r = detectUnsafeContent('hada chafar');
    expect(r.blocked).toBe(true);
    expect(r.matchedWords).toContain('chafar');
  });

  it('flags French "escroc" with apostrophe context', () => {
    const r = detectUnsafeContent("c'est un escroc");
    expect(r.blocked).toBe(true);
    expect(r.matchedWords).toContain('escroc');
  });

  it('flags English "scammer"', () => {
    const r = detectUnsafeContent('this is a scammer');
    expect(r.blocked).toBe(true);
    expect(r.matchedWords).toContain('scammer');
  });

  it('flags Arabic "نصاب"', () => {
    const r = detectUnsafeContent('هذا نصاب');
    expect(r.blocked).toBe(true);
    expect(r.matchedWords).toContain('نصاب');
  });

  it('returns the user-facing guidance message when blocked', () => {
    const r = detectUnsafeContent('escroc');
    expect(r.message).toMatch(/accusations directes/);
  });

  it('does not flag a clean factual sentence', () => {
    const r = detectUnsafeContent(
      'Paiement effectué le 12/04, produit non reçu, plus de réponse.',
    );
    expect(r.blocked).toBe(false);
    expect(r.matchedWords).toEqual([]);
  });

  it('handles intentional letter repetition (scammmer -> scammer)', () => {
    const r = detectUnsafeContent('this guy is a scammmer');
    expect(r.blocked).toBe(true);
    expect(r.matchedWords).toContain('scammer');
  });

  it('does not match substrings inside benign words (no "scam" inside "scampi")', () => {
    const r = detectUnsafeContent('we ate scampi for dinner');
    expect(r.blocked).toBe(false);
  });

  it('returns blocked=false for empty / whitespace input', () => {
    expect(detectUnsafeContent('').blocked).toBe(false);
    expect(detectUnsafeContent('   ').blocked).toBe(false);
  });

  it('flags the leetspeak digit form "7rami"', () => {
    const r = detectUnsafeContent('rah 7rami bezzaf');
    expect(r.blocked).toBe(true);
    expect(r.matchedWords).toContain('7rami');
  });
});
