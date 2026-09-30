import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { salonConfig, getWhatsAppUrl } from '../salonConfig';

export const WhatsAppButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    const handleScroll = () => setVisible(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <a
      href={getWhatsAppUrl(salonConfig.whatsappNumber)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 pl-4 pr-5 py-3 rounded-full bg-gradient-rose text-brand-white shadow-rose hover:shadow-lg hover:scale-105 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-white/20">
        <MessageCircle className="w-5 h-5 text-brand-white" aria-hidden="true" />
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-pinkLight" />
        </span>
      </span>
      <span className="font-semibold text-sm hidden sm:block">WhatsApp</span>
    </a>
  );
};
