'use client';

import { useEffect, useMemo, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Download,
  FileText,
  Image as ImageIcon,
  Download as DownloadIcon,
} from 'lucide-react';
import { ModerationDecision, type Decision } from '@/components/admin/ModerationDecision';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { getReport, STATUS_LABEL, type Status } from '@/lib/mock/signalements';

const STATUS_PILL: Record<Status, string> = {
  en_cours: 'bg-orange-100 text-orange-700',
  publie: 'bg-green-100 text-green-700',
  non_retenu: 'bg-red-100 text-red-700',
  a_corriger: 'bg-brand-sky text-brand-navy',
};

const DECISIONS_KEY = 'hadar:moderation-decisions';
const REASONS_KEY = 'hadar:moderation-reasons';

type DecisionStore = Record<string, Status>;
type ReasonStore = Record<string, string>;

function readStore<T>(key: string): T {
  if (typeof window === 'undefined') return {} as T;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : ({} as T);
  } catch {
    return {} as T;
  }
}

function writeStore<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const report = id ? getReport(id) : undefined;

  const [refreshKey, setRefreshKey] = useState(0);
  const [status, setStatus] = useState<Status | null>(null);
  const [savedReason, setSavedReason] = useState<string>('');

  useEffect(() => {
    if (!report) return;
    const decisions = readStore<DecisionStore>(DECISIONS_KEY);
    const reasons = readStore<ReasonStore>(REASONS_KEY);
    setStatus(decisions[report.id] ?? report.status);
    setSavedReason(reasons[report.id] ?? '');
  }, [report]);

  const currentStatus: Status = status ?? report?.status ?? 'en_cours';

  const exportRows = useMemo(
    () => (): (string | number)[][] => {
      if (!report) return [['Aucun signalement']];
      return [
        ['Champ', 'Valeur'],
        ['ID', `#${report.id}`],
        ['Statut', STATUS_LABEL[currentStatus]],
        ['Type de contact', report.contact],
        ['Contact signalé', report.contactMasked],
        ['Type de problème', report.problem],
        ['Montant', report.amount],
        ['Date', report.date],
        ['Utilisateur', report.userId],
        ['Description', report.description.join('\n')],
        ['Preuves', report.proofs.map((p) => p.name).join(' · ')],
        ['Motif modération', savedReason || '—'],
      ];
    },
    [report, currentStatus, savedReason],
  );

  const handleExport = () => {
    if (!report) return;
    const rows = exportRows();
    const csv = rows
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? '');
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(','),
      )
      .join('\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hadar-signalement-${report.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDecision = (decision: Decision, reason: string) => {
    if (!report) return;
    const decisions = readStore<DecisionStore>(DECISIONS_KEY);
    const reasons = readStore<ReasonStore>(REASONS_KEY);
    decisions[report.id] = decision;
    reasons[report.id] = reason;
    writeStore(DECISIONS_KEY, decisions);
    writeStore(REASONS_KEY, reasons);
    setStatus(decision);
    setSavedReason(reason);
  };

  if (!report) return notFound();

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/signalements"
            className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 bg-white text-brand-navy px-3.5 py-1.5 text-sm font-medium hover:border-brand-blue transition-all shadow-glow-soft hover:shadow-glow-navy"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Retour
          </Link>
          <nav aria-label="Fil d'ariane" className="text-xs text-gray-400 hidden sm:block">
            <Link href="/admin/signalements" className="hover:text-brand-navy">
              Signalements
            </Link>
            <span className="mx-2">/</span>
            <span className="text-brand-navy font-semibold">#{report.id}</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-1.5 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Rafraîchir
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-1.5 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue transition-all"
          >
            <Download className="h-4 w-4" aria-hidden />
            Exporter
          </button>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-2">Signalements</h1>

      <div className="flex items-center gap-2 flex-wrap text-sm text-gray-500 mb-8">
        <span className="font-semibold text-brand-navy">#{report.id} — Signalement</span>
        <span className="text-gray-300">|</span>
        <span
          className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${STATUS_PILL[currentStatus]}`}
        >
          <AnimatedCounter key={`${refreshKey}-${currentStatus}`} value={STATUS_LABEL[currentStatus]} />
        </span>
        <span className="text-gray-300">|</span>
        <span>
          ID Utilisateur :{' '}
          <Link
            href={`/admin/utilisateurs/${report.userId}`}
            className="text-brand-blue font-semibold hover:underline"
          >
            {report.userId.replace(/(\d{3})(\d{3})/, '$1 $2')}
          </Link>
        </span>
        <span className="text-gray-300">|</span>
        <span>Date : {report.date}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <div className="rounded-2xl bg-gray-50 border border-gray-200 shadow-glow-soft p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Infos principales
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Type de contact</dt>
              <dd className="font-semibold text-brand-navy">{report.contact}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Type de problème</dt>
              <dd className="font-semibold text-brand-navy">{report.problem}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Montant</dt>
              <dd className="font-semibold text-brand-navy">{report.amount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Contact signalé</dt>
              <dd className="font-mono text-sm text-brand-navy">{report.contactMasked}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl bg-gray-50 border border-gray-200 shadow-glow-soft p-5 lg:col-span-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Description
          </h2>
          <div className="text-sm text-brand-navy leading-relaxed max-h-48 overflow-y-auto pr-1 space-y-2">
            {report.description.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-gray-50 border border-gray-200 shadow-glow-soft p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Preuves
          </h2>
          <ul className="space-y-2">
            {report.proofs.map((proof) => {
              const Icon = proof.kind === 'pdf' ? FileText : ImageIcon;
              return (
                <li
                  key={proof.name}
                  className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <span className="inline-flex items-center gap-2 text-brand-navy min-w-0">
                    <Icon className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
                    <span className="truncate">{proof.name}</span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Télécharger ${proof.name}`}
                    onClick={() => window.alert(`Téléchargement de ${proof.name} (simulation)`)}
                    className="text-gray-400 hover:text-brand-navy shrink-0"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {savedReason && currentStatus !== 'en_cours' && (
        <div className="rounded-2xl bg-brand-sky/40 border border-brand-blue/30 p-4 mb-6 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/70 mb-1">
            Motif enregistré
          </p>
          <p className="text-brand-navy whitespace-pre-wrap">{savedReason}</p>
        </div>
      )}

      <ModerationDecision
        onSubmit={handleDecision}
        currentDecision={
          currentStatus === 'en_cours' ? null : (currentStatus as Decision)
        }
      />
    </div>
  );
}
