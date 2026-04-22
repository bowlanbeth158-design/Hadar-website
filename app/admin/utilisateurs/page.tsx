import type { Metadata } from 'next';
import { UserPlus } from 'lucide-react';
import { AdminPagePlaceholder } from '@/components/admin/AdminPagePlaceholder';

export const metadata: Metadata = { title: 'Utilisateurs' };

export default function Page() {
  return (
    <AdminPagePlaceholder
      title="Utilisateurs"
      subtitle="Usagers finaux de la plateforme — support et modération."
      Icon={UserPlus}
      bullets={[
        "Liste avec recherche (email, nom, statut, date d'inscription)",
        '4 actions par ligne (dropdown) : Voir · Sanctionner · Suspendre · Supprimer',
        'Sanctions : raison obligatoire enregistrée dans l’audit log',
        'Soft-delete 30 jours + restoration possible depuis la vue Archives',
        'Opérations en masse (bulk) pour la modération de campagnes de spam',
      ]}
    />
  );
}
