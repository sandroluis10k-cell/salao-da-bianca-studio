import {
  MapPin,
  Phone,
  MessageCircle,
  Instagram,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { Logo } from './Logo';
import { salonConfig, getWhatsAppUrl, getGoogleMapsUrl } from '../salonConfig';

const navLinks = [
  { id: 'inicio', label: 'Início' },
  { id: 'sobre', label: 'Sobre' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'trabalhos', label: 'Trabalhos' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'contato', label: 'Contato' },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const address = salonConfig.address;

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 84;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-[#0A0A0A]">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-gradient-rose opacity-[0.05] rounded-[100%] blur-3xl" />
      </div>

      <div className="container-page py-16 md:py-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-14">
          <div className="space-y-6 md:col-span-2 lg:col-span-1">
            <Logo size="md" />
            <p className="text-brand-white/60 text-[14px] leading-relaxed-plus max-w-xs">
              Cuidados capilares com atendimento personalizado em {address.city}.
              Valorizamos a beleza única de cada cliente.
            </p>
            {salonConfig.instagramUrl && (
              <a
                href={salonConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-pink hover:text-brand-pinkLight transition-colors text-sm font-medium group"
                aria-label="Instagram"
              >
                <span className="w-8 h-8 rounded-xl bg-gradient-rose-soft flex items-center justify-center border border-brand-pink/20 group-hover:shadow-glow-rose transition-all duration-300">
                  <Instagram className="w-4 h-4 text-brand-pink" strokeWidth={2.1} />
                </span>
                <span>@{salonConfig.instagramUsername || 'Instagram'}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
              </a>
            )}
          </div>

          <div>
            <h3 className="text-brand-white font-semibold mb-6 text-sm uppercase tracking-wide-md">Navegação</h3>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleNavClick(link.id)}
                    className="group text-brand-white/60 hover:text-brand-pink text-sm flex items-center gap-2 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-brand-pink shrink-0" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-brand-white font-semibold mb-6 text-sm uppercase tracking-wide-md">Endereço</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-pink shrink-0 mt-0.5" strokeWidth={2.1} aria-hidden="true" />
                <div className="text-sm">
                  <p className="text-brand-white/85 leading-relaxed-plus">
                    {address.street}, {address.block}, {address.lot}
                  </p>
                  <p className="text-brand-white/60 mt-1 leading-relaxed-plus">
                    {address.neighborhood}, {address.city}
                    {address.state ? ` - ${address.state}` : ''}
                  </p>
                </div>
              </div>
              <a
                href={getGoogleMapsUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-pink hover:text-brand-pinkLight transition-colors inline-flex items-center gap-1 pl-8 font-medium group"
              >
                Como chegar
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-brand-white font-semibold mb-6 text-sm uppercase tracking-wide-md">Contato</h3>
            <div className="space-y-4">
              <a
                href={getWhatsAppUrl(salonConfig.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-brand-white/80 hover:text-brand-pink transition-colors text-sm group"
              >
                <span className="w-8 h-8 rounded-xl bg-gradient-rose-soft flex items-center justify-center border border-brand-pink/20 group-hover:shadow-glow-rose transition-all duration-300">
                  <MessageCircle className="w-4 h-4 text-brand-pink" strokeWidth={2.1} aria-hidden="true" />
                </span>
                {salonConfig.whatsappDisplay}
              </a>
              <a
                href={`tel:+${salonConfig.whatsappNumber}`}
                className="flex items-center gap-3 text-brand-white/80 hover:text-brand-pink transition-colors text-sm group"
              >
                <span className="w-8 h-8 rounded-xl bg-brand-roseGold/10 flex items-center justify-center border border-brand-roseGold/20">
                  <Phone className="w-4 h-4 text-brand-roseGold" strokeWidth={2.1} aria-hidden="true" />
                </span>
                {salonConfig.whatsappDisplay}
              </a>
            </div>
          </div>
        </div>

        <div className="divider my-12" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs md:text-sm">
          <p className="text-brand-white/55 text-center sm:text-left tracking-wide">
            © {currentYear} {salonConfig.name} · Todos os direitos reservados.
          </p>
          <p className="text-brand-white/45 text-[11px] md:text-xs tracking-wide">
            Feito com cuidado para você · Rose Gold Edition
          </p>
        </div>
      </div>
    </footer>
  );
};
