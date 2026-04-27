/**
 * Content moderation for user-submitted reports.
 *
 * Detects direct insults, accusations, and defamatory terms across:
 *   - French    (escroc, arnaqueur, voleur, ...)
 *   - English   (scammer, thief, fraud, ...)
 *   - Classical Arabic
 *   - Darija Arabic (same script)
 *   - Darija in Latin letters / arabizi (chafar, nsab, 7rami, ...)
 *
 * Normalization:
 *   - lowercase
 *   - strip Latin diacritics (accents)
 *   - normalize Arabic letter variants
 *   - collapse repeated letters (scammmer -> scammer)
 *   - strip punctuation
 *   - collapse whitespace
 *
 * detectUnsafeContent(text) returns:
 *   { blocked, matchedWords, message }
 */

export const MODERATION_MESSAGE =
  "Merci d'éviter les accusations directes. Décrivez uniquement les faits observés.";

export const MODERATION_EXAMPLE =
  'Exemple : Paiement effectué le 12/04, produit non reçu, plus de réponse.';

// Forbidden vocabulary. Plurals and common variants are listed
// explicitly so the matcher stays simple (whole-word lookup).
// Arabic strings are written as \u-escapes so the source file is
// pure ASCII for build-tool safety.
export const FORBIDDEN_WORDS: string[] = [
  // ---------- French ----------
  'escroc', 'escrocs', 'escroquerie',
  'arnaqueur', 'arnaqueurs', 'arnaqueuse', 'arnaque',
  'voleur', 'voleurs', 'voleuse', 'voleuses', 'vol',
  'fraudeur', 'fraudeurs', 'fraudeuse', 'fraude',
  'menteur', 'menteurs', 'menteuse',
  'criminel', 'criminels', 'criminelle',
  'voyou', 'voyous',
  'salaud', 'salopard',
  'connard', 'connards',
  'enfoire',

  // ---------- English ----------
  'scammer', 'scammers', 'scam',
  'thief', 'thieves',
  'fraud', 'fraudster', 'fraudsters',
  'liar', 'liars',
  'criminal', 'criminals',
  'crook', 'crooks',
  'cheater', 'cheaters',
  'asshole',

  // ---------- Classical / standard Arabic ----------
  'نصاب',                                   // nassab
  'النصاب',                       // al-nassab
  'نصابين',                       // nassabin
  'نصابون',                       // nassabun
  'شفار',                                   // chaffar
  'الشفار',                       // al-chaffar
  'شفارين',                       // chaffarin
  'محتال',                             // mohtal
  'المحتال',                 // al-mohtal
  'محتالين',                 // mohtalin
  'سارق',                                   // sariq
  'السارق',                       // al-sariq
  'سارقين',                       // sariqin
  'سراق',                                   // surraq
  'كذاب',                                   // kaddab
  'الكذاب',                       // al-kaddab
  'كذابين',                       // kaddabin
  'لص',                                               // liss
  'اللص',                                   // al-liss
  'لصوص',                                   // lusus
  'حرامي',                             // harami
  'الحرامي',                 // al-harami
  'حرامية',                       // haramiya
  'مجرم',                                   // mojrim
  'المجرم',                       // al-mojrim
  'مجرمين',                       // mojrimin
  'كلب',                                         // kalb
  'كلاب',                                   // kilab

  // ---------- Darija Arabic in Latin letters / arabizi ----------
  'chafar', 'cheffar', 'chfar', 'chafara',
  'nassab', 'nsab', 'nassb',
  '7rami', 'harami', 'hrami', 'haramy',
  'keddab', 'kedab', 'kdab', 'kdeb', 'kadab',
  'mhtal', 'm7tal',
  'mecheft',
  'wld lhram', 'weld lhram',
  '7chouma', 'hchouma',
];

// Regex constants — written with explicit \u escape sequences so the
// source file stays ASCII-only.
const COMBINING_MARKS = /[̀-ͯ]/g; // Latin diacritics block
const ARABIC_BLOCK_TEST = /[؀-ۿ]/;
// Alef variants: إ (إ), أ (أ), آ (آ), ا (ا)
const ALEF_VARIANTS = /[إأآا]/g;
const TAA_MARBUTA = /ة/g;   // ة
const ALEF_MAQSURA = /ى/g;  // ى
// Allowed character class for normalize(): a-z, 0-9, Arabic block,
// whitespace. Anything else is replaced by a single space.
const NON_ALLOWED = /[^a-z0-9؀-ۿ\s]/g;
// Triple-or-more letter / digit collapse → keep two.
const TRIPLE_REPEAT = /(.)\1{2,}/g;

const ALEF_TARGET = 'ا';      // ا
const HEH_TARGET = 'ه';       // ه
const YEH_TARGET = 'ي';       // ي

/**
 * Normalize an arbitrary user string into a canonical lowercase form
 * suitable for whole-word comparison against the forbidden list.
 */
export function normalize(text: string): string {
  if (!text) return '';
  let n = text.toLowerCase();
  // Strip Latin diacritics
  n = n.normalize('NFD').replace(COMBINING_MARKS, '');
  // Arabic letter variants → canonical form
  n = n
    .replace(ALEF_VARIANTS, ALEF_TARGET)
    .replace(TAA_MARBUTA, HEH_TARGET)
    .replace(ALEF_MAQSURA, YEH_TARGET);
  // Collapse 3+ repeated letters/digits to 2.
  n = n.replace(TRIPLE_REPEAT, '$1$1');
  // Punctuation → space.
  n = n.replace(NON_ALLOWED, ' ');
  // Collapse whitespace.
  n = n.replace(/\s+/g, ' ').trim();
  return n;
}

const NORMALIZED_FORBIDDEN = FORBIDDEN_WORDS.map(normalize);

// Helper: escape a string for use inside a RegExp.
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Whole-word match against the normalized text.
 *   - Latin / arabizi words: anchored regex `(^|\s)WORD($|\s)` so
 *     "scam" fires in "this is a scam!" but not inside "scampi".
 *   - Arabic words: substring match (the article ال / clitics
 *     make `\b` unreliable on the Arabic block).
 */
function matchesWord(normText: string, normWord: string): boolean {
  if (!normWord) return false;
  const isArabicScript = ARABIC_BLOCK_TEST.test(normWord);
  if (isArabicScript) {
    return normText.includes(normWord);
  }
  const re = new RegExp(`(?:^|\\s)${escapeRegex(normWord)}(?=$|\\s)`);
  return re.test(normText);
}

export type ModerationResult = {
  blocked: boolean;
  matchedWords: string[];
  message: string;
};

/**
 * Public API. Returns:
 *   blocked: true if at least one forbidden word was matched
 *   matchedWords: the original (un-normalized) forbidden tokens hit
 *   message: user-facing reminder ("" when not blocked)
 */
export function detectUnsafeContent(text: string): ModerationResult {
  if (!text || text.trim() === '') {
    return { blocked: false, matchedWords: [], message: '' };
  }
  const norm = normalize(text);
  const matched: string[] = [];
  for (let i = 0; i < FORBIDDEN_WORDS.length; i++) {
    const original = FORBIDDEN_WORDS[i]!;
    const normalizedWord = NORMALIZED_FORBIDDEN[i]!;
    if (matchesWord(norm, normalizedWord)) {
      matched.push(original);
    }
  }
  return {
    blocked: matched.length > 0,
    matchedWords: matched,
    message: matched.length > 0 ? MODERATION_MESSAGE : '',
  };
}
