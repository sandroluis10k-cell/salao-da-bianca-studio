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
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-rose opacity-[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">
            Fale <span className="section-title-accent">conosco</span>
          </h2>
          <p className="text-brand-white/60 text-center max-w-2xl mx-auto">
            Estamos prontas para recebê-la. Entre em contato, consulte horários e agende seu atendimento.
          </p>
          <div className="w-20 h-1 bg-gradient-rose mx-auto rounded-full mt-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="card card-hover relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-rose" aria-hidden="true" />
              <div className="flex items-start gap-4 pl-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-rose/10 border border-brand-pink/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-brand-pink" />
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

            <div className="card card-hover relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-roseGold to-brand-pink" aria-hidden="true" />
              <div className="flex items-start gap-4 pl-2">
                <div className="w-12 h-12 rounded-xl bg-brand-roseGold/10 border border-brand-roseGold/20 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-brand-roseGold" />
                </div>
                <div className="flex-1">
                  <h3 className="text-brand-white font-semibold mb-3">Horários de atendimento</h3>
                  {hasHours ? (
                    <ul className="space-y-2">
                      {salonConfig.openingHours.map((h, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0"
                        >
                          <span className="text-brand-white/70">{h.day}</span>
                          <span className="text-brand-pink font-medium">{h.time}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="inline-flex items-center gap-2 text-brand-white/40 text-sm px-3 py-2 rounded-lg bg-white/5">
                      <Clock className="w-4 h-4 text-brand-roseGold/60" />
                      Horários pendentes — atualizar em <code className="text-brand-pink/60">salonConfig.ts</code>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {hasPayment && (
              <div className="card card-hover relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-pinkLight to-brand-pink" aria-hidden="true" />
                <div className="flex items-start gap-4 pl-2">
                  <div className="w-12 h-12 rounded-xl bg-brand-pinkLight/10 border border-brand-pinkLight/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-brand-pinkLight" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-brand-white font-semibold mb-3">Formas de pagamento</h3>
                    <div className="flex flex-wrap gap-2">
                      {salonConfig.paymentMethods.map((method, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand-pink/10 text-brand-pink border border-brand-pink/20"
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
            <div className="card relative overflow-hidden p-8">
              <div className="absolute inset-0 bg-gradient-rose opacity-5" aria-hidden="true" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-pink/20 rounded-full blur-3xl" aria-hidden="true" />

              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-rose flex items-center justify-center mb-6 shadow-rose">
                  <MessageCircle className="w-8 h-8 text-brand-white" />
                </div>

                <h3 className="text-2xl font-display font-semibold text-brand-white mb-2">
                  {salonConfig.shortName}
                </h3>
                <p className="text-brand-pinkLight text-sm tracking-wider uppercase mb-6">
                  {salonConfig.name.split(' - ')[1] || 'Salão de Beleza'}
                </p>

                <div className="space-y-4 mb-8">
                  <a
                    href={`tel:+${salonConfig.whatsappNumber}`}
                    className="flex items-center gap-3 text-brand-white/80 hover:text-brand-pink transition-colors"
                  >
                    <Phone className="w-4 h-4 text-brand-pink" />
                    <span className="text-sm">{salonConfig.whatsappDisplay}</span>
                  </a>
                  <div className="flex items-start gap-3 text-brand-white/80">
                    <MapPin className="w-4 h-4 text-brand-pink shrink-0 mt-0.5" />
                    <span className="text-sm">{formatAddress(address)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href={getWhatsAppUrl(salonConfig.whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Consultar horários pelo WhatsApp
                  </a>

                  <a
                    href={getGoogleMapsUrl(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full"
                  >
                    <Navigation className="w-5 h-5" />
                    Como chegar
                  </a>

                  {hasInstagram && (
                    <a
                      href={salonConfig.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline w-full"
                    >
                      <Instagram className="w-5 h-5" />
                      {salonConfig.instagramUsername
                        ? `@${salonConfig.instagramUsername}`
                        : 'Instagram'}
                    </a>
                  )}
                </div>

                <div className="mt-8 p-4 rounded-xl bg-brand-black/60 border border-brand-pink/10">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-brand-pink shrink-0 mt-0.5" />
                    <p className="text-brand-white/60 text-xs leading-relaxed">
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
