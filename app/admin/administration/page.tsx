import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { AdminPagePlaceholder } from '@/components/admin/AdminPagePlaceholder';

export const metadata: Metadata = { title: 'Administration' };

export default function Page() {
  return (
    <AdminPagePlaceholder
      title="Administration"
      subtitle="Configuration globale — accès réservé Super-admin."
      Icon={ShieldCheck}
      bullets={[
        'Seuils de niveau de risque (faible / vigilance / modéré / élevé)',
        'Taux de change MAD / EUR / USD (mise à jour automatique ou manuelle)',
        'Règles de modération et filtres de mots-clés',
        "Politique d'upload (types acceptés, tailles max, scan antivirus)",
        "Gestion des clés d'intégration (Cloudflare Turnstile, OAuth Google, SMTP, S3)",
      ]}
    />
  );
}
