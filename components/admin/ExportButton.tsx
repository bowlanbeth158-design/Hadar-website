'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, ChevronDown, Check, Copy, Sheet } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';

type Props = {
  filename: string;
  getRows: () => (string | number)[][];
  label?: string;
};

function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell);
          if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
          return s;
        })
        .join(','),
    )
    .join('\n');
}

function toTsv(rows: (string | number)[][]): string {
  return rows
    .map((row) => row.map((c) => String(c).replace(/\t/g, ' ').replace(/\n/g, ' ')).join('\t'))
    .join('\n');
}

function today(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function ExportButton({ filename, getRows, label }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const downloadCsv = () => {
    const rows = getRows();
    const csv = toCsv(rows);
    const bom = '﻿';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${today()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setOpen(false);
    showToast('CSV téléchargé');
  };

  const openInSheets = async () => {
    const rows = getRows();
    const tsv = toTsv(rows);
    const ok = await copyToClipboard(tsv);
    setOpen(false);
    if (ok) {
      showToast('Données copiées — collez dans Google Sheets (Ctrl+V)');
      window.open('https://docs.google.com/spreadsheets/create', '_blank', 'noopener');
    } else {
      showToast('Copie impossible, téléchargez le CSV à la place');
    }
  };

  const copyTsv = async () => {
    const rows = getRows();
    const tsv = toTsv(rows);
    const ok = await copyToClipboard(tsv);
    setOpen(false);
    showToast(ok ? 'Tableau copié dans le presse-papier' : 'Copie impossible');
  };

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-1.5 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
      >
        <Download className="h-4 w-4" aria-hidden />
        {label ?? t('common.export')}
        <ChevronDown className="h-3 w-3" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-white border border-gray-200 shadow-glow-navy overflow-hidden z-30 py-1"
        >
          <button
            type="button"
            role="menuitem"
            onClick={openInSheets}
            className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
          >
            <Sheet className="h-4 w-4 text-green-600 shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-brand-navy">Ouvrir dans Google Sheets</p>
              <p className="text-[11px] text-gray-500">
                Copie + ouvre un nouveau document Sheets
              </p>
            </div>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={copyTsv}
            className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
          >
            <Copy className="h-4 w-4 text-brand-blue shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-brand-navy">Copier le tableau</p>
              <p className="text-[11px] text-gray-500">Format TSV, collez n&apos;importe où</p>
            </div>
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
            role="menuitem"
            onClick={downloadCsv}
            className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-brand-navy">Télécharger CSV</p>
              <p className="text-[11px] text-gray-500">Sauvegarde locale universelle</p>
            </div>
          </button>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="absolute right-0 top-full mt-2 z-20 rounded-xl bg-brand-navy text-white px-4 py-2 text-xs font-medium shadow-glow-navy whitespace-nowrap flex items-center gap-2"
        >
          <Check className="h-3.5 w-3.5 text-green-400" aria-hidden />
          {toast}
        </div>
      )}
    </div>
  );
}
