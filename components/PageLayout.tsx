import { Header } from './Header';
import { Footer } from './Footer';
import { SupportFab } from './SupportFab';

type Props = {
  children: React.ReactNode;
  /** Use a narrower content cap (1280px → ~33% empty on Full HD) for
   *  user-account pages like Mes alertes, Mes signalements, Mon profil.
   *  Default cap is 1440px (~25% empty on Full HD). */
  narrow?: boolean;
};

export function PageLayout({ children, narrow = false }: Props) {
  return (
    <>
      <Header />
      <main
        className={`mx-auto px-4 md:px-6 py-10 md:py-14 ${
          narrow ? 'max-w-[1280px]' : 'max-w-[1440px]'
        }`}
      >
        {children}
      </main>
      <Footer />
      <SupportFab />
    </>
  );
}
