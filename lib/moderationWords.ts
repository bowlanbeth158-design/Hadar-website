/**
 * Content moderation for user-submitted reports.
 *
 * Detects direct insults, accusations, and defamatory terms across
 * French, English, classical Arabic, darija Arabic, and darija
 * written in Latin letters / arabizi.
 *
 * detectUnsafeContent(text) returns:
 *   { blocked, matchedWords, message }
 *
 * Source file is ASCII-safe: all regex literals use \uXXXX escape
 * sequences for Unicode codepoints. Arabic vocabulary strings
 * inside the FORBIDDEN_WORDS array are also \u-escaped so the
 * file does not depend on the editor's handling of RTL text.
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

  // ---------- Classical / standard Arabic (\u-escaped) ----------
  'نصاب',                         // nassab
  'النصاب',             // al-nassab
  'نصابين',             // nassabin
  'نصابون',             // nassabun
  'شفار',                         // chaffar
  'الشفار',             // al-chaffar
  'شفارين',             // chaffarin
  'محتال',                   // mohtal
  'المحتال',       // al-mohtal
  'محتالين',       // mohtalin
  'سارق',                         // sariq
  'السارق',             // al-sariq
  'سارقين',             // sariqin
  'سراق',                         // surraq
  'كذاب',                         // kaddab
  'الكذاب',             // al-kaddab
  'كذابين',             // kaddabin
  'لص',                                     // liss
  'اللص',                         // al-liss
  'لصوص',                         // lusus
  'حرامي',                   // harami
  'الحرامي',       // al-harami
  'حرامية',             // haramiya
  'مجرم',                         // mojrim
  'المجرم',             // al-mojrim
  'مجرمين',             // mojrimin
  'كلب',                               // kalb
  'كلاب',                         // kilab

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

// All regex use \uXXXX escapes — the source file is ASCII-safe.
const COMBINING_MARKS = /[̀-ͯ]/g;          // Latin diacritics
const ARABIC_BLOCK_TEST = /[؀-ۿ]/;
const ALEF_VARIANTS = /[إأآا]/g; // إ أ آ ا
const TAA_MARBUTA = /ة/g;                       // ة
const ALEF_MAQSURA = /ى/g;                      // ى
const NON_ALLOWED = /[^a-z0-9؀-ۿ\s]/g;
const TRIPLE_REPEAT = /(.)\1{2,}/g;
const WHITESPACE = /\s+/g;

const ALEF_TARGET = 'ا';   // ا
const HEH_TARGET = 'ه';    // ه
const YEH_TARGET = 'ي';    // ي

/**
 * Normalize an arbitrary user string into a canonical lowercase form
 * suitable for whole-word comparison against the forbidden list.
 */
export function normalize(text: string): string {
  if (!text) return '';
  let n = text.toLowerCase();
  n = n.normalize('NFD').replace(COMBINING_MARKS, '');
  n = n
    .replace(ALEF_VARIANTS, ALEF_TARGET)
    .replace(TAA_MARBUTA, HEH_TARGET)
    .replace(ALEF_MAQSURA, YEH_TARGET);
  n = n.replace(TRIPLE_REPEAT, '$1$1');
  n = n.replace(NON_ALLOWED, ' ');
  n = n.replace(WHITESPACE, ' ').trim();
  return n;
}

const NORMALIZED_FORBIDDEN = FORBIDDEN_WORDS.map(normalize);

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
