import Header from '@/components/Header';
import Hero from '@/components/Hero';
import RetirementCalculator from '@/components/RetirementCalculator';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="page">
      <Header />
      <main id="main-content" tabIndex="-1">
        <Hero />
        <RetirementCalculator />
      </main>
      <Footer />
    </div>
  );
}
