import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { salonConfig, getWhatsAppUrl } from '../salonConfig';

export const WhatsAppButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 1500);
    const handleScroll = () => setVisible(window.scrollY > 120);
    const onScroll = window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll as unknown as EventListenerOrEventListenerObject);
    };
  }, []);

  return (
    <a
      href={getWhatsAppUrl(salonConfig.whatsappNumber)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className={`group fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 flex items-center gap-3 pl-3.5 pr-5 py-3 rounded-full bg-gradient-rose text-brand-white shadow-glow-rose
        hover:shadow-[0_0_0_1px_rgba(244,194,205,0.25),0_30px_80px_-20px_rgba(232,138,162,0.85)]
        hover:-translate-y-0.5 active:translate-y-0
        transition-all duration-400 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-white/15">
        <MessageCircle className="w-5 h-5 text-brand-white" strokeWidth={2.1} aria-hidden="true" />
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-white opacity-80" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gradient-to-br from-brand-pinkLight to-brand-pink border border-brand-white/40" />
        </span>
      </span>
      <span className="font-semibold text-sm hidden sm:block tracking-wide-sm">WhatsApp</span>
    </a>
  );
};
