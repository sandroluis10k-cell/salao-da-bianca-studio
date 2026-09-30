import { Calendar, Sparkles, ArrowDown } from 'lucide-react';
import { Logo } from '../components/Logo';
import { salonConfig, getWhatsAppUrl } from '../salonConfig';

export const HeroSection = () => {
  const handleScrollToServices = () => {
    const el = document.getElementById('servicos');
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      <div className="absolute inset-0 bg-gradient-dark" aria-hidden="true" />

      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-brand-pink/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-roseGold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-brand-pink/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-brand-roseGold/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-brand-pink/10 rounded-full" />
      </div>

      <div className="absolute top-20 right-10 opacity-20 animate-float" aria-hidden="true">
        <Sparkles className="w-8 h-8 text-brand-pink" />
      </div>
      <div className="absolute bottom-40 left-10 opacity-20 animate-float" style={{ animationDelay: '1s' }} aria-hidden="true">
        <Sparkles className="w-6 h-6 text-brand-roseGold" />
      </div>
      <div className="absolute top-1/3 right-1/4 opacity-15 animate-float" style={{ animationDelay: '3s' }} aria-hidden="true">
        <Sparkles className="w-5 h-5 text-brand-pinkLight" />
      </div>

      <div className="relative z-10 container-page">
        <div className="flex flex-col items-center text-center animate-fade-in-up">
          <div className="mb-10 animate-float">
            <Logo size="xl" />
          </div>

          <div className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-pink/10 border border-brand-pink/20 text-brand-pink text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-pulse" />
              Atendimento personalizado em {salonConfig.address.city}
            </span>
          </div>

          <h1 className="section-title max-w-4xl mb-6">
            Realce sua <span className="section-title-accent">beleza</span> e cuide de você
          </h1>

          <p className="text-brand-white/70 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            {salonConfig.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <a
              href={getWhatsAppUrl(salonConfig.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary min-w-[240px]"
            >
              <Calendar className="w-5 h-5" />
              Agendar pelo WhatsApp
            </a>
            <button onClick={handleScrollToServices} className="btn-secondary min-w-[240px]">
              Ver serviços e preços
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float" aria-hidden="true">
        <button
          onClick={handleScrollToServices}
          className="flex flex-col items-center gap-2 text-brand-white/40 hover:text-brand-pink transition-colors"
          aria-label="Rolar para serviços"
        >
          <span className="text-xs tracking-widest uppercase">Role para ver mais</span>
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
};
