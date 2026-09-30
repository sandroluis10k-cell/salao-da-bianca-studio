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
  return (
    <div className="min-h-screen bg-brand-black relative overflow-x-hidden">
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
