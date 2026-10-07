import { useState } from 'react';
import { Calendar, Clock, Info, Scissors, Check } from 'lucide-react';
import { SectionWrapper } from '../components/SectionWrapper';
import {
  salonConfig,
  formatCurrency,
  getWhatsAppUrl,
  getServiceBookingMessage,
  Service,
} from '../salonConfig';

export const ServicesSection = () => {
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  const getBookUrl = (service: Service) =>
    getWhatsAppUrl(salonConfig.whatsappNumber, getServiceBookingMessage(service));

  return (
    <SectionWrapper id="servicos" className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-brand-pink/[0.06] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[520px] h-[520px] bg-brand-roseGold/[0.05] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16 md:mb-20 reveal-block">
          <span className="section-eyebrow mb-5">Nossos serviços</span>
          <h2 className="section-title mt-4">
            Serviços e <span className="section-title-accent">preços</span>
          </h2>
          <p className="section-subtitle mt-6">
            Confira os principais cuidados capilares oferecidos. Para mais informações ou personalizações, consulte diretamente pelo WhatsApp.
          </p>
          <div className="section-divider" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {salonConfig.services.map((service, idx) => (
            <div
              key={service.name}
              className={`card card-hover relative overflow-hidden reveal-block ${
                hoveredService === service.name ? 'border-brand-pink/40' : ''
              }`}
              style={{ transitionDelay: `${Math.min(idx * 40, 280)}ms` }}
            >
              <div
                className="absolute -top-20 -right-20 w-52 h-52 rounded-full transition-opacity duration-500 pointer-events-none"
                aria-hidden="true"
                style={{
                  background:
                    'radial-gradient(circle at center, rgba(232,138,162,0.16), rgba(232,138,162,0) 65%)',
                  opacity: hoveredService === service.name ? 1 : 0,
                }}
              />

              {service.pendingConfirmation && (
                <div className="absolute top-4 right-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-roseGold/15 text-brand-roseGold text-[11px] font-semibold border border-brand-roseGold/25"
                    title="Descrição ou detalhe pendente de confirmação"
                  >
                    <Info className="w-3.5 h-3.5" />
                    A confirmar
                  </span>
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ease-out ${
                    hoveredService === service.name
                      ? 'bg-gradient-rose text-brand-white shadow-glow-rose -translate-y-0.5'
                      : 'bg-brand-pink/10 text-brand-pink border border-brand-pink/15'
                  }`}
                >
                  <Scissors className="w-5 h-5" strokeWidth={2.1} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-brand-white mb-1.5 pr-20">
                    {service.name}
                  </h3>
                  <p className="text-2xl md:text-[1.75rem] font-display font-bold bg-gradient-to-r from-brand-pink via-brand-pinkLight to-brand-roseGold bg-clip-text text-transparent">
                    {formatCurrency(service.price)}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-5 ml-16">
                {service.description ? (
                  <p className="text-brand-white/62 text-sm leading-relaxed-plus">
                    {service.description}
                  </p>
                ) : !service.pendingConfirmation ? null : (
                  <p className="text-brand-white/35 text-sm italic">
                    Descrição do serviço pendente de confirmação.
                  </p>
                )}

                {service.duration && (
                  <div className="flex items-center gap-2 text-brand-white/55 text-sm">
                    <Clock className="w-4 h-4 text-brand-pink" strokeWidth={2.1} />
                    {service.duration}
                  </div>
                )}
              </div>

              <a
                href={getBookUrl(service)}
                target="_blank"
                rel="noopener noreferrer"
                className={`ml-16 inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-400 ease-out ${
                  hoveredService === service.name
                    ? 'bg-gradient-rose text-brand-white shadow-glow-rose -translate-y-0.5'
                    : 'bg-white/[0.04] text-brand-pink border border-brand-pink/20 hover:border-brand-pink/50'
                }`}
                aria-label={`Agendar ${service.name}`}
              >
                <Calendar className="w-4 h-4" strokeWidth={2.1} />
                Agendar este serviço
              </a>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center reveal-block">
          <div className="inline-flex items-center gap-4 px-6 sm:px-8 py-5 rounded-3xl bg-brand-black/70 backdrop-blur-sm border border-brand-pink/10 shadow-soft-card">
            <div className="w-9 h-9 rounded-full bg-gradient-rose-soft flex items-center justify-center shrink-0 border border-brand-pink/20">
              <Check className="w-4 h-4 text-brand-pink" strokeWidth={2.4} />
            </div>
            <p className="text-brand-white/65 text-sm leading-relaxed text-left text-pretty">
              Valores informados pela empresa e sujeitos a confirmação no momento do agendamento.
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
