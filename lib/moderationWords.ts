/**
 * Content moderation for user-submitted reports.
 *
 * Detects direct insults, accusations, and defamatory terms across:
 *   - French    (escroc, arnaqueur, voleur, …)
 *   - English   (scammer, thief, fraud, …)
 *   - Classical Arabic   (نصاب, شفار, محتال, …)
 *   - Darija Arabic       (same script)
 *   - Darija in Latin letters / arabizi (chafar, nsab, 7rami, …)
 *
 * Normalization:
 *   - lowercase
 *   - strip Latin diacritics (é → e, à → a, …)
 *   - normalize Arabic letter variants (أ/إ/آ → ا, ة → ه, ى → ي)
 *   - collapse repeated letters (scammmer → scammer)
 *   - strip punctuation
 *   - collapse whitespace
 *
 * detectUnsafeContent(text) returns:
 *   { blocked, matchedWords, message }
 *
 * The UI uses `blocked` to disable the submit button and `message`
 * to show the user-facing reminder. Text is never auto-redacted —
 * the user keeps full control of what they wrote.
 */

export const MODERATION_MESSAGE =
  "Merci d'éviter les accusations directes. Décrivez uniquement les faits observés.";

export const MODERATION_EXAMPLE =
  'Exemple : Paiement effectué le 12/04, produit non reçu, plus de réponse.';

// Forbidden vocabulary. Plurals and common variants are listed
// explicitly so the matcher stays simple (whole-word lookup).
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
  'نصاب', 'النصاب', 'نصابين', 'نصابون',
  'شفار', 'الشفار', 'شفارين',
  'محتال', 'المحتال', 'محتالين',
  'سارق', 'السارق', 'سارقين', 'سراق',
  'كذاب', 'الكذاب', 'كذابين',
  'لص', 'اللص', 'لصوص',
  'حرامي', 'الحرامي', 'حرامية',
  'مجرم', 'المجرم', 'مجرمين',
  'كلب', 'كلاب',

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
// source file stays ASCII-only. A previous version had literal
// combining-mark / Arabic-range characters in the regex which broke
// some build pipelines.
const COMBINING_MARKS = /[̀-ͯ]/g;
const ARABIC_BLOCK_GLOBAL = /[؀-ۿ]/g;
const ARABIC_BLOCK_TEST = /[؀-ۿ]/;
const ALEF_VARIANTS = /[إأآا]/g; // إ أ آ ا
const TAA_MARBUTA = /ة/g; // ة
const ALEF_MAQSURA = /ى/g; // ى
// Allowed character class for normalize(): a-z, 0-9, Arabic block,
// whitespace. Anything else is replaced by a single space.
const NON_ALLOWED = /[^a-z0-9؀-ۿ\s]/g;
// Triple-or-more letter / digit collapse → keep two.
const TRIPLE_REPEAT = /(.)\1{2,}/g;

/**
 * Normalize an arbitrary user string into a canonical lowercase form
 * suitable for whole-word comparison against the forbidden list.
 */
export function normalize(text: string): string {
  if (!text) return '';
  let n = text.toLowerCase();
  // Strip Latin diacritics (é, à, ç, …)
  n = n.normalize('NFD').replace(COMBINING_MARKS, '');
  // Arabic letter variants → canonical form
  n = n
    .replace(ALEF_VARIANTS, 'ا') // ا
    .replace(TAA_MARBUTA, 'ه')   // ه
    .replace(ALEF_MAQSURA, 'ي'); // ي
  // Collapse 3+ repeated letters/digits to 2 (scammmmer → scammer,
  // n3aaaal → n3aal). Two-letter doubles like "ll" / "tt" are left
  // alone because they're legitimate in many words.
  n = n.replace(TRIPLE_REPEAT, '$1$1');
  // Punctuation → space (keeps Latin alphanum, Arabic block, digits)
  n = n.replace(NON_ALLOWED, ' ');
  // Collapse whitespace
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
 *   - Latin / arabizi words use boundary anchors so "scam" doesn't
 *     fire inside "scampi" but does fire inside "this is a scam!".
 *   - Arabic words use a substring check because Arabic morphology
 *     prefixes the article ال and suffixes possessives without a
 *     space, so word boundaries are unreliable.
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
  // Reset .lastIndex on the global regex constants so successive
  // calls don't carry state. (Belt-and-braces — we only call them
  // through .replace(), which does reset internally.)
  COMBINING_MARKS.lastIndex = 0;
  ARABIC_BLOCK_GLOBAL.lastIndex = 0;
  return {
    blocked: matched.length > 0,
    matchedWords: matched,
    message: matched.length > 0 ? MODERATION_MESSAGE : '',
  };
}
