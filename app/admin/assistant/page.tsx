import type { Metadata } from 'next';
import { MessageCircle } from 'lucide-react';
import { AdminPagePlaceholder } from '@/components/admin/AdminPagePlaceholder';

export const metadata: Metadata = { title: 'Assistant' };

export default function Page() {
  return (
    <AdminPagePlaceholder
      title="Assistant"
      subtitle="Support Hub — supervision du chatbot utilisateur et tickets."
      Icon={MessageCircle}
      bullets={[
        "Supervision 3 colonnes : liste conversations · thread actif · fiche utilisateur",
        'Statuts : bot (auto) · en attente (escalade) · en cours · résolu',
        'Actions : reprendre la main, assigner à un membre, ajouter note interne, tagger',
        'Filtres : Non assignées · Mes conversations · Résolues · Par tag',
        'Réponses pré-rédigées (canned responses) pour gagner du temps',
      ]}
    />
  );
}
