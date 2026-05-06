'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Scale } from 'lucide-react';
import { ContestationModal } from '@/components/ContestationModal';
import { PageLayout } from '@/components/PageLayout';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [open, setOpen] = useState(true);

  return (
    <PageLayout narrow>
      <div className="mx-auto max-w-md py-12 text-center">
        <Scale className="mx-auto h-10 w-10 text-brand-blue mb-3" />
        <h1 className="text-2xl font-bold text-brand-navy mb-2">
          Contester un signalement
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Si vous êtes la personne signalée et que vous pensez que ce
          signalement est erroné, ouvrez la fenêtre ci-dessous pour
          contester.
        </p>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex rounded-pill bg-brand-navy text-white px-5 py-2 text-sm font-semibold hover:bg-brand-blue"
          >
            Ouvrir le formulaire
          </button>
        )}
      </div>
      <ContestationModal
        open={open}
        reportId={id}
        onClose={() => setOpen(false)}
      />
    </PageLayout>
  );
}
