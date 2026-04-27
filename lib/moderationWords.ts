/**
 * Content moderation for user-submitted reports — simple version.
 *
 * Detects direct insults, accusations, and defamatory terms.
 * Languages covered: French, English, classical / darija Arabic,
 * darija written in Latin letters / arabizi.
 *
 * Implementation deliberately avoids any Unicode regex literals
 * so the source file is build-pipeline safe. The forbidden words
 * are stored as plain string literals; matching is done via
 * lowercase substring includes (with whole-word check for Latin
 * tokens).
 */

export const MODERATION_MESSAGE =
  "Merci d'eviter les accusations directes. Decrivez uniquement les faits observes.";

export const MODERATION_EXAMPLE =
  'Exemple : Paiement effectue le 12/04, produit non recu, plus de reponse.';

// Forbidden vocabulary. Plurals and common variants are listed
// explicitly so the matcher stays simple.
export const FORBIDDEN_WORDS: string[] = [
  // ---------- French ----------
  'escroc', 'escrocs', 'escroquerie',
  'arnaqueur', 'arnaqueurs', 'arnaqueuse', 'arnaque',
  'voleur', 'voleurs', 'voleuse', 'voleuses',
  'fraudeur', 'fraudeurs', 'fraudeuse',
  'menteur', 'menteurs', 'menteuse',
  'criminel', 'criminels', 'criminelle',
  'voyou', 'voyous',
  'salaud', 'salopard',
  'connard', 'connards',

  // ---------- English ----------
  'scammer', 'scammers', 'scam',
  'thief', 'thieves',
  'fraudster', 'fraudsters',
  'liar', 'liars',
  'crook', 'crooks',
  'cheater', 'cheaters',
  'asshole',

  // ---------- Classical / standard Arabic ----------
  'نصاب',
  'النصاب',
  'نصابين',
  'نصابون',
  'شفار',
  'الشفار',
  'محتال',
  'المحتال',
  'سارق',
  'السارق',
  'سراق',
  'كذاب',
  'الكذاب',
  'لص',
  'اللص',
  'لصوص',
  'حرامي',
  'الحرامي',
  'مجرم',
  'المجرم',

  // ---------- Darija Arabic in Latin letters / arabizi ----------
  'chafar', 'cheffar', 'chfar',
  'nassab', 'nsab',
  '7rami', 'harami', 'hrami',
  'keddab', 'kedab', 'kdab',
  'mhtal', 'm7tal',
  'mecheft',
];

const NORMALIZED_FORBIDDEN = FORBIDDEN_WORDS.map((w) => w.toLowerCase());

// Heuristic: does the word contain any non-ASCII char? If so we
// treat it as an Arabic-script word and use substring match.
function isNonAscii(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) > 127) return true;
  }
  return false;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesWord(text: string, word: string): boolean {
  if (!word) return false;
  if (isNonAscii(word)) {
    return text.includes(word);
  }
  // ASCII / arabizi token: anchored on whitespace or start/end so
  // "scam" fires inside "this is a scam!" but not inside "scampi".
  const re = new RegExp('(?:^|\\s)' + escapeRegex(word) + '(?=$|\\s|\\W)');
  return re.test(text);
}

export type ModerationResult = {
  blocked: boolean;
  matchedWords: string[];
  message: string;
};

export function detectUnsafeContent(text: string): ModerationResult {
  if (!text || text.trim() === '') {
    return { blocked: false, matchedWords: [], message: '' };
  }
  // Lowercase + collapse whitespace; strip the most common Latin
  // accents via a string-replace map (no Unicode regex).
  let lower = text.toLowerCase();
  lower = lower
    .split('é').join('e')
    .split('è').join('e')
    .split('ê').join('e')
    .split('ë').join('e')
    .split('à').join('a')
    .split('â').join('a')
    .split('î').join('i')
    .split('ï').join('i')
    .split('ô').join('o')
    .split('ö').join('o')
    .split('û').join('u')
    .split('ù').join('u')
    .split('ü').join('u')
    .split('ç').join('c');
  lower = lower.replace(/\s+/g, ' ').trim();

  const matched: string[] = [];
  for (let i = 0; i < FORBIDDEN_WORDS.length; i++) {
    const original = FORBIDDEN_WORDS[i]!;
    const normalizedWord = NORMALIZED_FORBIDDEN[i]!;
    if (matchesWord(lower, normalizedWord)) {
      matched.push(original);
    }
  }
  return {
    blocked: matched.length > 0,
    matchedWords: matched,
    message: matched.length > 0 ? MODERATION_MESSAGE : '',
  };
}

export function normalize(text: string): string {
  // Kept for any future test that imports this — same logic as
  // detectUnsafeContent's normalisation step.
  let lower = (text || '').toLowerCase();
  lower = lower
    .split('é').join('e')
    .split('è').join('e')
    .split('ê').join('e')
    .split('ë').join('e')
    .split('à').join('a')
    .split('â').join('a')
    .split('î').join('i')
    .split('ï').join('i')
    .split('ô').join('o')
    .split('ö').join('o')
    .split('û').join('u')
    .split('ù').join('u')
    .split('ü').join('u')
    .split('ç').join('c');
  return lower.replace(/\s+/g, ' ').trim();
}
