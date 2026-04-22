import type { Metadata } from 'next';
import { Settings } from 'lucide-react';
import { AdminPagePlaceholder } from '@/components/admin/AdminPagePlaceholder';

export const metadata: Metadata = { title: 'Paramètres' };

export default function Page() {
  return (
    <AdminPagePlaceholder
      title="Paramètres"
      subtitle="Préférences personnelles — 4 onglets."
      Icon={Settings}
      bullets={[
        'Compte : informations personnelles, avatar',
        'Sécurité : mot de passe, 2FA, sessions actives',
        'Rôle : permissions (lecture seule, selon le rôle attribué)',
        "Général : langue, devise, préférences d'affichage, notifications",
      ]}
    />
  );
}
