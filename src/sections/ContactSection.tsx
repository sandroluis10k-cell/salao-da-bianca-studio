import {
  MapPin,
  MessageCircle,
  Clock,
  Instagram,
  Navigation,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { SectionWrapper } from '../components/SectionWrapper';
import {
  salonConfig,
  getWhatsAppUrl,
  getGoogleMapsUrl,
  formatAddress,
} from '../salonConfig';

export const ContactSection = () => {
  const address = salonConfig.address;
  const hasHours = salonConfig.openingHours.length > 0;
  const hasInstagram = Boolean(salonConfig.instagramUrl);
  const hasPayment = salonConfig.paymentMethods.length > 0;

  return (
    <SectionWrapper id="contato" className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[880px] h-[880px] bg-gradient-rose opacity-[0.04] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16 md:mb-20 reveal-block">
          <span className="section-eyebrow mb-5">Fale com a gente</span>
          <h2 className="section-title mt-4">
            Fale <span className="section-title-accent">conosco</span>
          </h2>
          <p className="section-subtitle mt-6">
            Estamos prontas para recebê-la. Entre em contato, consulte horários e agende seu atendimento.
          </p>
          <div className="section-divider" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 md:gap-6">
          <div className="lg:col-span-3 space-y-5">
            <div className="card card-hover relative overflow-hidden reveal-block">
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-3xl bg-gradient-rose" aria-hidden="true" />
              <div className="flex items-start gap-4 pl-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-rose-soft border border-brand-pink/25 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-brand-pink" strokeWidth={2.1} />
                </div>
                <div className="flex-1">
                  <h3 className="text-brand-white font-semibold mb-2">Endereço</h3>
                  <p className="text-brand-white/80 text-sm leading-relaxed mb-1">
                    {address.street}, {address.block}, {address.lot}
                  </p>
                  <p className="text-brand-white/60 text-sm">
                    {address.neighborhood}, {address.city}
                    {address.state ? ` - ${address.state}` : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="card card-hover relative overflow-hidden reveal-block">
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-3xl bg-gradient-to-b from-brand-roseGold to-brand-pink" aria-hidden="true" />
              <div className="flex items-start gap-4 pl-2">
                <div className="w-12 h-12 rounded-2xl bg-brand-roseGold/10 border border-brand-roseGold/25 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-brand-roseGold" strokeWidth={2.1} />
                </div>
                <div className="flex-1">
                  <h3 className="text-brand-white font-semibold mb-3">Horários de atendimento</h3>
                  {hasHours ? (
                    <ul className="space-y-2">
                      {salonConfig.openingHours.map((h, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between text-sm py-2.5 border-b border-white/[0.06] last:border-0"
                        >
                          <span className="text-brand-white/75">{h.day}</span>
                          <span className="text-brand-pink font-semibold tracking-wide">{h.time}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="inline-flex items-center gap-2 text-brand-white/50 text-sm px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                      <Clock className="w-4 h-4 text-brand-roseGold/70" strokeWidth={2.1} />
                      Horários pendentes — atualizar em <code className="text-brand-pink/70 font-mono text-[12px]">salonConfig.ts</code>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {hasPayment && (
              <div className="card card-hover relative overflow-hidden reveal-block">
                <div className="absolute top-0 left-0 w-1 h-full rounded-l-3xl bg-gradient-to-b from-brand-pinkLight to-brand-pink" aria-hidden="true" />
                <div className="flex items-start gap-4 pl-2">
                  <div className="w-12 h-12 rounded-2xl bg-brand-pinkLight/10 border border-brand-pinkLight/25 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-brand-pinkLight" strokeWidth={2.1} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-brand-white font-semibold mb-3">Formas de pagamento</h3>
                    <div className="flex flex-wrap gap-2">
                      {salonConfig.paymentMethods.map((method, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-rose-soft text-brand-pinkLight border border-brand-pink/25"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="card relative overflow-hidden p-7 md:p-8 reveal-block">
              <div className="absolute inset-0 bg-gradient-rose opacity-[0.06] pointer-events-none" aria-hidden="true" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-pink/25 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-rose flex items-center justify-center mb-6 shadow-glow-rose">
                  <MessageCircle className="w-8 h-8 text-brand-white" strokeWidth={2.1} />
                </div>

                <h3 className="text-2xl md:text-[1.8rem] font-display font-semibold text-brand-white mb-2 tracking-tighter">
                  {salonConfig.shortName}
                </h3>
                <p className="text-brand-pinkLight text-xs tracking-[0.2em] uppercase mb-6">
                  {salonConfig.name.split(' - ')[1] || 'Salão de Beleza'}
                </p>

                <div className="space-y-4 mb-8">
                  <a
                    href={`tel:+${salonConfig.whatsappNumber}`}
                    className="flex items-center gap-3 text-brand-white/80 hover:text-brand-pink transition-colors"
                  >
                    <Phone className="w-4 h-4 text-brand-pink" strokeWidth={2.1} />
                    <span className="text-sm">{salonConfig.whatsappDisplay}</span>
                  </a>
                  <div className="flex items-start gap-3 text-brand-white/80">
                    <MapPin className="w-4 h-4 text-brand-pink shrink-0 mt-0.5" strokeWidth={2.1} />
                    <span className="text-sm leading-relaxed">{formatAddress(address)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href={getWhatsAppUrl(salonConfig.whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full"
                  >
                    <MessageCircle className="w-5 h-5" strokeWidth={2.1} />
                    Consultar horários pelo WhatsApp
                  </a>

                  <a
                    href={getGoogleMapsUrl(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full"
                  >
                    <Navigation className="w-5 h-5" strokeWidth={2.1} />
                    Como chegar
                  </a>

                  {hasInstagram && (
                    <a
                      href={salonConfig.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline w-full"
                    >
                      <Instagram className="w-5 h-5" strokeWidth={2.1} />
                      {salonConfig.instagramUsername
                        ? `@${salonConfig.instagramUsername}`
                        : 'Instagram'}
                    </a>
                  )}
                </div>

                <div className="mt-8 p-4 md:p-5 rounded-2xl bg-brand-black/60 border border-brand-pink/10">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-brand-pink shrink-0 mt-0.5" strokeWidth={2.1} />
                    <p className="text-brand-white/62 text-xs leading-relaxed-plus">
                      O horário estará confirmado somente após a resposta do salão.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
