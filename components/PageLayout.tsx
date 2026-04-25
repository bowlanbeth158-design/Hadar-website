import { Header } from './Header';
import { Footer } from './Footer';
import { SupportFab } from './SupportFab';

type Props = {
  children: React.ReactNode;
};

export function PageLayout({ children }: Props) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1620px] px-4 md:px-6 py-10 md:py-14">{children}</main>
      <Footer />
      <SupportFab />
    </>
  );
}
