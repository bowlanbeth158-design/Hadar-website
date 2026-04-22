import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SupportFab } from '@/components/SupportFab';
import { HomeHero } from '@/components/HomeHero';
import { PlatformStats } from '@/components/PlatformStats';
import { RecentReports } from '@/components/RecentReports';
import { ProcessSteps } from '@/components/ProcessSteps';

type SearchParams = { q?: string; type?: string };

export default function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const query = searchParams.q?.trim() ?? '';
  const type = searchParams.type?.trim();

  return (
    <>
      <Header />

      <main>
        <HomeHero initialType={type} initialQuery={query} />
        <PlatformStats />
        <RecentReports />
        <ProcessSteps />
      </main>

      <Footer />
      <SupportFab />
    </>
  );
}
