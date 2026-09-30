import {
  MapPin,
  Phone,
  MessageCircle,
  Instagram,
  ChevronRight,
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
    if (el) {
      const offset = 80;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-brand-blackSecondary border-t border-white/5">
      <div className="container-page py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Logo size="md" />
            <p className="text-brand-white/60 text-sm leading-relaxed">
              Cuidados capilares com atendimento personalizado em {address.city}.
            </p>
            {salonConfig.instagramUrl && (
              <a
                href={salonConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-pink hover:text-brand-pinkLight transition-colors text-sm"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
                <span>{salonConfig.instagramUsername || 'Instagram'}</span>
              </a>
            )}
          </div>

          <div>
            <h3 className="text-brand-white font-semibold mb-6 text-base">Navegação</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleNavClick(link.id)}
                    className="text-brand-white/60 hover:text-brand-pink text-sm flex items-center gap-2 group transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-brand-white font-semibold mb-6 text-base">Endereço</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-pink shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-sm">
                  <p className="text-brand-white/80">
                    {address.street}, {address.block}, {address.lot}
                  </p>
                  <p className="text-brand-white/60 mt-1">
                    {address.neighborhood}, {address.city}
                    {address.state ? ` - ${address.state}` : ''}
                  </p>
                </div>
              </div>
              <a
                href={getGoogleMapsUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-pink hover:text-brand-pinkLight transition-colors inline-flex items-center gap-1 pl-8"
              >
                Como chegar
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-brand-white font-semibold mb-6 text-base">Contato</h3>
            <div className="space-y-4">
              <a
                href={getWhatsAppUrl(salonConfig.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-brand-white/80 hover:text-brand-pink transition-colors text-sm"
              >
                <MessageCircle className="w-5 h-5 text-brand-pink" aria-hidden="true" />
                {salonConfig.whatsappDisplay}
              </a>
              <a
                href={`tel:+${salonConfig.whatsappNumber}`}
                className="flex items-center gap-3 text-brand-white/80 hover:text-brand-pink transition-colors text-sm"
              >
                <Phone className="w-5 h-5 text-brand-pink" aria-hidden="true" />
                {salonConfig.whatsappDisplay}
              </a>
            </div>
          </div>
        </div>

        <div className="divider my-12" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-brand-white/50 text-center sm:text-left">
            © {currentYear} {salonConfig.name} - Todos os direitos reservados.
          </p>
          <p className="text-brand-white/40 text-xs">
            Feito com cuidado para você.
          </p>
        </div>
      </div>
    </footer>
  );
};
