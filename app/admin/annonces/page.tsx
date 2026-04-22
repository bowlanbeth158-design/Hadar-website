import type { Metadata } from 'next';
import { Megaphone } from 'lucide-react';
import { AdminPagePlaceholder } from '@/components/admin/AdminPagePlaceholder';

export const metadata: Metadata = { title: 'Annonces' };

export default function Page() {
  return (
    <AdminPagePlaceholder
      title="Annonces"
      subtitle="Broadcast Center — bandeaux et notifications plateforme."
      Icon={Megaphone}
      bullets={[
        'Créer une annonce (titre, message, portée, canaux de diffusion)',
        'Portée : tous les utilisateurs / utilisateurs connectés / segment spécifique',
        'Canaux : bandeau top site · popup · email · push',
        'Planification : publier maintenant ou à une date donnée, avec expiration',
        'Historique des annonces avec métriques (vus, cliqués, fermés)',
      ]}
    />
  );
}
