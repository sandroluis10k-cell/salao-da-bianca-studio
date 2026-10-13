import { useState, useEffect } from 'react';
import { Menu, X, Calendar, ChevronRight } from 'lucide-react';
import { Logo } from './Logo';
import { salonConfig, getWhatsAppUrl, openBooking } from '../salonConfig';

const navLinks = [
  { id: 'inicio', label: 'Início' },
  { id: 'sobre', label: 'Sobre' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'trabalhos', label: 'Trabalhos' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'contato', label: 'Contato' },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 18);
    };
    const onScroll = window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', onScroll as unknown as EventListenerOrEventListenerObject);
  }, []);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-80px 0px -62% 0px', threshold: 0 },
    );
    navLinks.forEach((link) => {
      const el = document.getElementById(link.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const handleNavClick = (id: string) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 84;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? 'bg-brand-black/80 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_8px_40px_-15px_rgba(0,0,0,0.7)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container-page">
        <div className="flex items-center justify-between h-20 md:h-24">
          <Logo size="md" />

          <nav className="hidden lg:flex items-center gap-9" aria-label="Navegação principal">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`nav-link text-[13px] font-medium ${
                  activeSection === link.id ? 'text-brand-white after:w-full' : ''
                }`}
                aria-current={activeSection === link.id ? 'page' : undefined}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:block">
            <a
              href={getWhatsAppUrl(salonConfig.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                openBooking();
              }}
              className="btn-primary text-[13px] py-2.5 px-5"
            >
              <Calendar className="w-4 h-4" strokeWidth={2.2} />
              Agendar horário
            </a>
          </div>

          <button
            className="lg:hidden p-2.5 rounded-xl text-brand-white hover:text-brand-pink hover:bg-white/5 transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isOpen ? <X className="w-6 h-6" strokeWidth={2.1} /> : <Menu className="w-6 h-6" strokeWidth={2.1} />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`lg:hidden overflow-hidden transition-all duration-500 ease-out ${
          isOpen ? 'max-h-[640px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-page pb-8 pt-3 bg-brand-black/95 backdrop-blur-xl border-t border-white/[0.07]">
          <nav className="flex flex-col gap-1" aria-label="Navegação mobile">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`group flex items-center justify-between text-left py-3.5 px-4 rounded-2xl text-[15px] font-medium transition-all duration-300 ${
                  activeSection === link.id
                    ? 'bg-gradient-rose-soft text-brand-pink border border-brand-pink/20'
                    : 'text-brand-white/80 hover:bg-white/[0.04] hover:text-brand-pink'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight
                  className={`w-4 h-4 transition-all duration-300 ${
                    activeSection === link.id
                      ? 'opacity-100 translate-x-0 text-brand-pink'
                      : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-brand-pink'
                  }`}
                />
              </button>
            ))}
          </nav>
          <div className="mt-7">
            <a
              href={getWhatsAppUrl(salonConfig.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                openBooking();
              }}
              className="btn-primary w-full text-[14px]"
            >
              <Calendar className="w-4 h-4" strokeWidth={2.2} />
              Agendar horário
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
