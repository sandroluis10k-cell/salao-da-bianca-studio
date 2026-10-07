import { useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { HeroSection } from './sections/HeroSection';
import { AboutSection } from './sections/AboutSection';
import { ServicesSection } from './sections/ServicesSection';
import { GallerySection } from './sections/GallerySection';
import { ReviewsSection } from './sections/ReviewsSection';
import { InstagramSection } from './sections/InstagramSection';
import { ContactSection } from './sections/ContactSection';

function App() {
  // Smooth anchor hash restoration + reset scroll ao reabrir página
  useEffect(() => {
    const goToHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;
      const el = document.getElementById(hash);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - 84;
      window.setTimeout(() => window.scrollTo({ top: y, behavior: 'smooth' }), 60);
    };
    goToHash();
    window.addEventListener('hashchange', goToHash);
    // Evita rolagem antiga no refresh
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    return () => window.removeEventListener('hashchange', goToHash);
  }, []);

  return (
    <div className="min-h-screen bg-brand-black relative overflow-x-hidden text-pretty">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <GallerySection />
        <ReviewsSection />
        <InstagramSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
