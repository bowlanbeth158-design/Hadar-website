'use client';

import { useState } from 'react';
import { Download, Check } from 'lucide-react';

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

function today(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ExportButton({ filename, getRows, label = 'Exporter' }: Props) {
  const [done, setDone] = useState(false);

  const handle = () => {
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
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handle}
      className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-1.5 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
      title="Export CSV compatible Google Sheets, Excel, Numbers"
    >
      {done ? <Check className="h-4 w-4" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
      {done ? 'Exporté' : label}
    </button>
  );
}
