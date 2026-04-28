// Content moderation for the report form Description field.
//
// Goal: catch direct accusations / insults / defamatory terms in
// French, English, classical Arabic, darija (Arabic script) and
// darija written in Latin letters with leetspeak digits (e.g. "7"
// for the Arabic ha sound).
//
// IMPORTANT - historical Vercel build failures:
//   A previous attempt at this lib used Arabic characters and
//   combining marks inside regex character classes AS LITERAL
//   characters, which broke the Vercel build. To avoid recurrence,
//   every non-ASCII codepoint inside a regex MUST be expressed as
//   a \uXXXX escape sequence. Plain string literals can hold
//   Arabic characters as UTF-8 - only regex literals are sensitive.
//
// Behaviour: this lib never modifies the user's text. It only
// returns a verdict + the matched lemmas so the UI can guide the
// user toward a factual rewrite.

export type ModerationResult = {
  blocked: boolean;
  matchedWords: string[];
  message: string;
};

export const MODERATION_MESSAGE =
  "Merci d'éviter les accusations directes. Décrivez uniquement les faits observés.";

export const MODERATION_HINT =
  "Exemple : Paiement effectué le 12/04, produit non reçu, plus de réponse.";

// Forbidden lemmas grouped by language.
//
// The normaliser strips accents, lowercases, collapses runs of 3+
// identical characters down to 2, and turns every non-alphanumeric
// non-Arabic character into a space. So "ESCROC" / "escroc" /
// "escroccc" all reduce to "escroc" before matching.
//
// Add aggressively here - false positives on a 300-char accusation
// field are cheap (the user just rewrites), false negatives mean a
// defamatory report goes through.
const FORBIDDEN: string[] = [
  // ---------- French ----------
  'escroc',
  'escroquerie',
  'escrocs',
  'arnaque',
  'arnaqueur',
  'arnaqueuse',
  'arnaqueurs',
  'voleur',
  'voleuse',
  'voleurs',
  'voler',
  'menteur',
  'menteuse',
  'menteurs',
  'menti',
  'salaud',
  'salope',
  'connard',
  'connasse',
  'pute',
  'enfoire',
  'encule',
  'fdp',
  'batard',
  'tapette',
  // ---------- English ----------
  'scammer',
  'scam',
  'scammers',
  'thief',
  'thieves',
  'fraud',
  'fraudster',
  'fraudsters',
  'liar',
  'crook',
  'asshole',
  'bastard',
  'bitch',
  // ---------- Arabic (classical / standard / darija in Arabic script) ----------
  // String literals are UTF-8 source - only regex literals are
  // restricted to ASCII (see header note).
  'نصاب',
  'نصابة',
  'نصابين',
  'محتال',
  'محتالة',
  'محتالين',
  'سارق',
  'سارقة',
  'سارقين',
  'لص',
  'لصوص',
  'حرامي',
  'حرامية',
  'كذاب',
  'كذابة',
  'كاذب',
  'كاذبة',
  'شفار',
  'شفارة',
  'وغد',
  'حقير',
  // ---------- Darija - Latin letters with leetspeak digits ----------
  'nsab',
  'nassab',
  'nassaba',
  'chafar',
  'cheffar',
  'chfar',
  'cheffara',
  'chafara',
  '7rami',
  '7ramiya',
  '7ramia',
  'harami',
  'haramia',
  'haramiya',
  'keddab',
  'kdab',
  'kaddab',
  'kdoub',
  'mhtal',
  'mahtal',
  'l3ar',
  'm3afen',
  'wgheed',
  '7grom',
];

// Token boundary = anything that is NOT a Latin letter, digit or
// Arabic codepoint (Arabic block U+0600..U+06FF). Built from a
// string then passed to RegExp so the Arabic range stays as a \u
// escape - the build never sees a literal Arabic character inside
// a regex character class.
const TOKEN_BOUNDARY = '[^a-z0-9\\u0600-\\u06ff]';

function makeMatcher(word: string): RegExp {
  // Escape every regex metachar in the lemma itself before splicing
  // it into the boundary template.
  const safe = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(?:^|' + TOKEN_BOUNDARY + ')' + safe + '(?:' + TOKEN_BOUNDARY + '|$)');
}

// Combining Diacritical Marks block U+0300..U+036F (used to strip
// diacritics after NFD normalisation). Built dynamically so the
// codepoints stay as \u escapes in the source.
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');
// Runs of 3+ identical characters collapsed to 2 - handles
// "scammmmer" -> "scammer", "voooleur" -> "vooleur".
const REPEATED_LETTER = /(.)\1{2,}/g;
// Punctuation / whitespace runs collapsed to a single space.
// Built dynamically so the Arabic range stays as a \u escape.
const NON_TOKEN_RUN = new RegExp('[^a-z0-9\\u0600-\\u06ff]+', 'g');

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(REPEATED_LETTER, '$1$1')
    .replace(NON_TOKEN_RUN, ' ')
    .trim();
}

const MATCHERS: { word: string; re: RegExp }[] = FORBIDDEN.map((w) => {
  const norm = normalizeText(w);
  return { word: norm, re: makeMatcher(norm) };
});

export function detectUnsafeContent(text: string): ModerationResult {
  const normalised = normalizeText(text);
  if (!normalised) {
    return { blocked: false, matchedWords: [], message: '' };
  }
  // Pad with spaces so the boundary group at start/end always has
  // a non-token character to match against.
  const padded = ' ' + normalised + ' ';
  const matched = new Set<string>();
  for (const { word, re } of MATCHERS) {
    if (re.test(padded)) matched.add(word);
  }
  if (matched.size === 0) {
    return { blocked: false, matchedWords: [], message: '' };
  }
  return {
    blocked: true,
    matchedWords: Array.from(matched),
    message: MODERATION_MESSAGE,
  };
}
