import fs from 'node:fs/promises';
import path from 'node:path';

const LEGAL_DIR = path.join(process.cwd(), 'design', 'legal');

export async function loadLegal(fileName: string): Promise<string> {
  const filePath = path.join(LEGAL_DIR, fileName);
  const raw = await fs.readFile(filePath, 'utf-8');
  return stripFrontMatter(raw);
}

function stripFrontMatter(md: string): string {
  let s = md.trimStart();
  s = s.replace(/^#\s+[^\n]*\n+/, '');
  s = s.replace(/^(>\s*[^\n]*\n)+/, '');
  return s.trimStart();
}
