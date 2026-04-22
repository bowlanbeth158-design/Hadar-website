import type { Metadata } from 'next';
import { BarChart3 } from 'lucide-react';
import { AdminPagePlaceholder } from '@/components/admin/AdminPagePlaceholder';

export const metadata: Metadata = { title: 'Statistiques' };

export default function Page() {
  return (
    <AdminPagePlaceholder
      title="Statistiques"
      subtitle="Analyse détaillée — 4 pages glissantes."
      Icon={BarChart3}
      bullets={[
        'Page 1 · Vue globale : KPI, évolution, taux de traitement',
        'Page 2 · Répartition par problème (non livraison, blocage, etc.)',
        'Page 3 · Répartition par canal (téléphone, WhatsApp, email…)',
        'Page 4 · UX & satisfaction : score de satisfaction, taux de retour, commentaires',
        'Graphiques hybrides count ↔ pourcentage, seuils de niveau de risque verrouillés',
      ]}
    />
  );
}
