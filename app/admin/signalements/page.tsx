import type { Metadata } from 'next';
import { Siren } from 'lucide-react';
import { AdminPagePlaceholder } from '@/components/admin/AdminPagePlaceholder';

export const metadata: Metadata = { title: 'Signalements' };

export default function Page() {
  return (
    <AdminPagePlaceholder
      title="Signalements"
      subtitle="File de modération — examiner, publier ou refuser les signalements utilisateurs."
      Icon={Siren}
      bullets={[
        'Filtres par statut (En attente / À corriger / Publié / Refusé / Archivé)',
        'Recherche par contact, type de problème, utilisateur ou date',
        "Fiche détail : informations, preuves, historique d'action, décision de modération",
        'Actions : Publier · Demander correction · Refuser (raison obligatoire) · Archiver',
      ]}
    />
  );
}
