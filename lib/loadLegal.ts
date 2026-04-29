import fs from 'node:fs/promises';
import path from 'node:path';

const LEGAL_DIR = path.join(process.cwd(), 'design', 'legal');

// Read a single legal markdown file (FR canonical).
export async function loadLegal(fileName: string): Promise<string> {
  const filePath = path.join(LEGAL_DIR, fileName);
  const raw = await fs.readFile(filePath, 'utf-8');
  return stripFrontMatter(raw);
}

// Per-locale loader. Tries to read the locale-specific variant
// (e.g. 03-faq.en.md / .ar.md) and falls back to the canonical FR
// file when the variant doesn't exist yet.
//
// Returns the FR + EN + AR markdown as a record so the host page
// can hand the full triple to a client component that picks the
// right one based on the active locale at render time.
export type LocalisedMarkdown = { fr: string; en: string; ar: string };

export async function loadLegalLocalised(
  fileName: string,
): Promise<LocalisedMarkdown> {
  const fr = await loadLegal(fileName);
  const en = await tryLoadVariant(fileName, 'en', fr);
  const ar = await tryLoadVariant(fileName, 'ar', fr);
  return { fr, en, ar };
}

async function tryLoadVariant(
  fileName: string,
  locale: 'en' | 'ar',
  fallback: string,
): Promise<string> {
  const variantName = fileName.replace(/\.md$/, `.${locale}.md`);
  try {
    return await loadLegal(variantName);
  } catch {
    return fallback;
  }
}

function stripFrontMatter(md: string): string {
  let s = md.trimStart();
  s = s.replace(/^#\s+[^\n]*\n+/, '');
  s = s.replace(/^(>\s*[^\n]*\n)+/, '');
  return s.trimStart();
}
