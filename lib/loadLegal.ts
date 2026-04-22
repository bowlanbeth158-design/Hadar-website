import fs from 'node:fs/promises';
import path from 'node:path';

const LEGAL_DIR = path.join(process.cwd(), 'design', 'legal');

export async function loadLegal(fileName: string): Promise<string> {
  const filePath = path.join(LEGAL_DIR, fileName);
  return fs.readFile(filePath, 'utf-8');
}
