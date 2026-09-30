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
    <SectionWrapper id="servicos" className="bg-brand-blackSecondary/50 relative">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-roseGold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">
            Serviços e <span className="section-title-accent">preços</span>
          </h2>
          <p className="text-brand-white/60 text-center max-w-2xl mx-auto">
            Confira os principais cuidados capilares oferecidos. Para mais informações ou personalizações, consulte diretamente pelo WhatsApp.
          </p>
          <div className="w-20 h-1 bg-gradient-rose mx-auto rounded-full mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {salonConfig.services.map((service) => (
            <div
              key={service.name}
              className={`card card-hover relative overflow-hidden ${
                hoveredService === service.name ? 'border-brand-pink/40' : ''
              }`}
              onMouseEnter={() => setHoveredService(service.name)}
              onMouseLeave={() => setHoveredService(null)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-rose opacity-0 group-hover:opacity-5 rounded-full -translate-y-16 translate-x-16 transition-opacity duration-500" aria-hidden="true" />

              {service.pendingConfirmation && (
                <div className="absolute top-3 right-3">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-roseGold/15 text-brand-roseGold text-xs font-medium border border-brand-roseGold/20"
                    title="Descrição ou detalhe pendente de confirmação"
                  >
                    <Info className="w-3 h-3" />
                    A confirmar
                  </span>
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  hoveredService === service.name
                    ? 'bg-gradient-rose text-brand-white'
                    : 'bg-brand-pink/10 text-brand-pink'
                }`}>
                  <Scissors className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-brand-white mb-1 pr-20">
                    {service.name}
                  </h3>
                  <p className="text-2xl font-display font-bold bg-gradient-to-r from-brand-pink to-brand-roseGold bg-clip-text text-transparent">
                    {formatCurrency(service.price)}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-5 ml-16">
                {service.description ? (
                  <p className="text-brand-white/60 text-sm leading-relaxed">
                    {service.description}
                  </p>
                ) : !service.pendingConfirmation ? null : (
                  <p className="text-brand-white/30 text-sm italic">
                    Descrição do serviço pendente de confirmação.
                  </p>
                )}

                {service.duration && (
                  <div className="flex items-center gap-2 text-brand-white/50 text-sm">
                    <Clock className="w-4 h-4 text-brand-pink" />
                    {service.duration}
                  </div>
                )}
              </div>

              <a
                href={getBookUrl(service)}
                target="_blank"
                rel="noopener noreferrer"
                className={`ml-16 inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-300 ${
                  hoveredService === service.name
                    ? 'bg-gradient-rose text-brand-white shadow-rose'
                    : 'bg-white/5 text-brand-pink border border-brand-pink/20 hover:border-brand-pink/50'
                }`}
                aria-label={`Agendar ${service.name}`}
              >
                <Calendar className="w-4 h-4" />
                Agendar este serviço
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-brand-black/60 border border-brand-pink/10">
            <div className="w-8 h-8 rounded-full bg-brand-pink/10 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-brand-pink" />
            </div>
            <p className="text-brand-white/60 text-sm text-left">
              Valores informados pela empresa e sujeitos a confirmação no momento do agendamento.
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
