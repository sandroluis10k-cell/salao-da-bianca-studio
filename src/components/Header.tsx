import { useState, useEffect } from 'react';
import { Menu, X, Calendar } from 'lucide-react';
import { Logo } from './Logo';
import { salonConfig, getWhatsAppUrl } from '../salonConfig';

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
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    navLinks.forEach((link) => {
      const el = document.getElementById(link.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id: string) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-brand-black/95 backdrop-blur-md shadow-lg border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="container-page">
        <div className="flex items-center justify-between h-20">
          <Logo size="md" />

          <nav className="hidden lg:flex items-center gap-8" aria-label="Navegação principal">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`nav-link text-sm font-medium ${
                  activeSection === link.id ? 'text-brand-pink after:w-full' : ''
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
              className="btn-primary text-sm py-2.5 px-5"
            >
              <Calendar className="w-4 h-4" />
              Agendar horário
            </a>
          </div>

          <button
            className="lg:hidden p-2 text-brand-white hover:text-brand-pink transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-page pb-6 pt-2 bg-brand-black/98 backdrop-blur-md border-t border-white/5">
          <nav className="flex flex-col gap-1" aria-label="Navegação mobile">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left py-3 px-4 rounded-lg text-base font-medium transition-colors ${
                  activeSection === link.id
                    ? 'bg-brand-pink/10 text-brand-pink'
                    : 'text-brand-white/80 hover:bg-white/5 hover:text-brand-pink'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="mt-6">
            <a
              href={getWhatsAppUrl(salonConfig.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-sm"
            >
              <Calendar className="w-4 h-4" />
              Agendar horário
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
