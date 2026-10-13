import { useEffect, useRef, useState } from 'react';
import { Calendar, Sparkles, ArrowDown, Phone } from 'lucide-react';
import { Logo } from '../components/Logo';
import { salonConfig, getWhatsAppUrl, openBooking } from '../salonConfig';

export const HeroSection = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const grainRef = useRef<HTMLCanvasElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const handleScrollToServices = () => {
    const el = document.getElementById('servicos');
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Canvas de grain cinematográfico leve (1% de ruído) — só cria se tela grande
  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.ceil(canvas.clientWidth * dpr);
      canvas.height = Math.ceil(canvas.clientHeight * dpr);
      drawNoise();
    };

    const drawNoise = () => {
      const { width, height } = canvas;
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;
      // Ruído monocromático claro — gera só 1/4 dos pixels e replica (desempenho)
      const step = 4;
      for (let i = 0; i < data.length; i += 4 * step) {
        const v = 220 + Math.random() * 35;
        const a = 22 + Math.random() * 18;
        for (let j = 0; j < step; j++) {
          const k = i + j * 4;
          data[k] = v;
          data[k + 1] = v - 6;
          data[k + 2] = v - 14;
          data[k + 3] = a;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // ===========================================
  // Efeito cinematográfico controlado por scroll (parallax + zoom + fade)
  // - Usa requestAnimationFrame + transform3d (GPU, sem layout thrashing)
  // - Pausa listener quando a section sai da viewport (performance mobile)
  // ===========================================
  useEffect(() => {
    const hero = heroRef.current;
    const image = imageRef.current;
    const overlay = overlayRef.current;
    if (!hero || !image) return;

    let rafId = 0;
    let sectionRect = hero.getBoundingClientRect();
    let running = false;

    const updateRect = () => {
      sectionRect = hero.getBoundingClientRect();
    };

    const onScroll = () => {
      if (!running) {
        running = true;
        rafId = window.requestAnimationFrame(render);
      }
    };

    const render = () => {
      running = false;
      updateRect();

      // Só aplica parallax enquanto a section estiver razoavelmente visível
      const vh = window.innerHeight;
      if (sectionRect.bottom < -200 || sectionRect.top > vh * 1.6) {
        rafId = window.requestAnimationFrame(render);
        return;
      }

      const sectionH = Math.max(sectionRect.height, vh);
      const progress = Math.min(1.25, Math.max(0, -sectionRect.top / (sectionH * 0.92)));

      const translateY = -progress * sectionH * 0.20;
      const scale = 1 + progress * 0.09;
      const vignette = 0.34 + progress * 0.38;
      const overlayOpacity = 0.58 + progress * 0.24;
      const grainOpacity = 0.06 + progress * 0.04;

      image.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
      if (grainRef.current) {
        grainRef.current.style.opacity = grainOpacity.toFixed(3);
      }
      if (overlay) {
        overlay.style.background =
          `radial-gradient(ellipse 68% 62% at 50% 42%, rgba(5,5,5,0) 0%, rgba(5,5,5,${vignette}) 86%), ` +
          `linear-gradient(180deg, rgba(5,5,5,${(overlayOpacity * 0.18).toFixed(3)}) 0%, rgba(5,5,5,${overlayOpacity.toFixed(3)}) 100%)`;
      }

      rafId = window.requestAnimationFrame(render);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsVisible(entry.isIntersecting));
      },
      { threshold: 0.01, rootMargin: '12% 0px 12% 0px' },
    );
    io.observe(hero);

    updateRect();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateRect, { passive: true });
    render();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateRect);
      window.cancelAnimationFrame(rafId);
      io.disconnect();
      if (image) image.style.transform = '';
      if (overlay) overlay.style.background = '';
      if (grainRef.current) grainRef.current.style.opacity = '';
    };
  }, []);

  const hasHeroImage = Boolean(salonConfig.heroImageUrl);

  return (
    <section
      id="inicio"
      ref={heroRef}
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-24 pb-20"
      aria-label="Seção principal"
    >
      {/* ===========================================
          PLANO DE FUNDO: Foto com parallax cinematográfico
          =========================================== */}
      {hasHeroImage ? (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            ref={imageRef}
            className="absolute -inset-[8%] will-change-transform origin-center"
            style={{
              transform: 'translate3d(0,0,0) scale(1)',
              backfaceVisibility: 'hidden',
              perspective: '1000px',
            }}
          >
            <img
              src={salonConfig.heroImageUrl!}
              alt={`${salonConfig.name} - Destaque visual`}
              fetchPriority="high"
              decoding="async"
              loading="eager"
              className="w-full h-full object-cover object-center"
              style={{
                objectPosition: 'center 28%',
                filter: isVisible
                  ? 'saturate(1.07) contrast(1.04) brightness(0.94)'
                  : 'saturate(1) contrast(1) brightness(1)',
                transition: 'filter 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-dark" aria-hidden="true" />
      )}

      {/* Overlay com vinheta e gradiente dinâmico (controlado no scroll por JS) */}
      <div
        ref={overlayRef}
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background: hasHeroImage
            ? 'radial-gradient(ellipse 68% 62% at 50% 42%, rgba(5,5,5,0) 0%, rgba(5,5,5,0.55) 86%), linear-gradient(180deg, rgba(5,5,5,0.10) 0%, rgba(5,5,5,0.78) 100%)'
            : undefined,
        }}
      />

      {/* Glow orbs suaves por cima da foto */}
      <div className="absolute inset-0 hero-glow pointer-events-none" aria-hidden="true" />

      {/* Grain cinematográfico (ruído) */}
      <canvas
        ref={grainRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay opacity-[0.08] select-none"
      />

      {/* Elementos decorativos suaves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[18%] -left-24 w-80 h-80 bg-brand-pink/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-[22%] -right-24 w-[28rem] h-[28rem] bg-brand-roseGold/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '2.4s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] border border-brand-pink/[0.07] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[470px] h-[470px] border border-brand-roseGold/[0.08] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] border border-brand-pink/[0.1] rounded-full" />
      </div>

      {/* Sparkles leves */}
      <div className="hidden sm:block absolute top-28 right-10 md:right-16 opacity-25 animate-float pointer-events-none" aria-hidden="true">
        <Sparkles className="w-8 h-8 text-brand-pink" />
      </div>
      <div
        className="hidden md:block absolute bottom-44 left-10 lg:left-16 opacity-25 animate-float pointer-events-none"
        style={{ animationDelay: '1s' }}
        aria-hidden="true"
      >
        <Sparkles className="w-6 h-6 text-brand-roseGold" />
      </div>
      <div
        className="hidden lg:block absolute top-[34%] right-[22%] opacity-20 animate-float pointer-events-none"
        style={{ animationDelay: '3s' }}
        aria-hidden="true"
      >
        <Sparkles className="w-5 h-5 text-brand-pinkLight" />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 container-page">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 sm:mb-10 animate-fade-in-down">
            <Logo size="xl" />
          </div>

          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="section-eyebrow animate-pulse-glow">
              <span className="relative flex w-1.5 h-1.5 rounded-full">
                <span className="absolute inline-flex w-full h-full rounded-full bg-brand-pinkLight opacity-75 animate-ping" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-brand-pinkLight" />
              </span>
              Atendimento personalizado em {salonConfig.address.city}
            </span>
          </div>

          <h1
            className="section-title max-w-5xl mb-6 text-balance animate-fade-in-up"
            style={{ animationDelay: '0.22s' }}
          >
            Realce sua <span className="section-title-accent">beleza</span>
            <br className="hidden sm:block" />
            <span className="text-brand-white/95">e cuide de você</span>
          </h1>

          <p
            className="section-subtitle mb-10 md:mb-12 animate-fade-in-up text-pretty"
            style={{ animationDelay: '0.34s' }}
          >
            {salonConfig.heroSubtitle}
          </p>

          <div
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-fade-in-up"
            style={{ animationDelay: '0.48s' }}
          >
            <a
              href={getWhatsAppUrl(salonConfig.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                openBooking();
              }}
              className="btn-primary min-w-[240px] sm:min-w-[260px]"
            >
              <Calendar className="w-5 h-5" />
              Agendar meu horário
            </a>
            <button onClick={handleScrollToServices} className="btn-secondary min-w-[240px] sm:min-w-[260px]">
              <Phone className="w-4 h-4" strokeWidth={2.2} />
              Ver serviços e preços
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 animate-fade-in-up"
        style={{ animationDelay: '0.9s' }}
        aria-hidden="true"
      >
        <button
          onClick={handleScrollToServices}
          className="group flex flex-col items-center gap-2.5 text-brand-white/40 hover:text-brand-pink transition-colors duration-300"
          aria-label="Rolar para serviços"
        >
          <span className="text-[11px] tracking-[0.22em] uppercase font-medium">Role para ver mais</span>
          <span className="relative flex w-6 h-10 items-start justify-center rounded-full border border-brand-white/20 group-hover:border-brand-pink/60 transition-colors">
            <ArrowDown className="w-3.5 h-3.5 mt-2 animate-bounce-soft text-current" />
          </span>
        </button>
      </div>
    </section>
  );
};
