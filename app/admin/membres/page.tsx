import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { AdminPagePlaceholder } from '@/components/admin/AdminPagePlaceholder';

export const metadata: Metadata = { title: 'Membres' };

export default function Page() {
  return (
    <AdminPagePlaceholder
      title="Membres"
      subtitle="Équipe interne Hadar — gestion des rôles et permissions."
      Icon={Users}
      bullets={[
        'Liste des membres (nom, email, rôle, dernière connexion)',
        'Rôles : Super-admin · Admin · Modérateur · Support',
        'Ajouter / éditer / désactiver un membre',
        'Matrice des permissions par rôle (lecture seule pour Support, etc.)',
      ]}
    />
  );
}
