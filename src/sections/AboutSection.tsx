import { Camera } from 'lucide-react';
import { SectionWrapper } from '../components/SectionWrapper';
import { salonConfig } from '../salonConfig';

export const AboutSection = () => {
  const hasImage = Boolean(salonConfig.aboutImageUrl);

  return (
    <SectionWrapper id="sobre" className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-10 left-1/4 w-[520px] h-[520px] bg-brand-roseGold/[0.05] rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-10 w-[460px] h-[460px] bg-brand-pink/[0.05] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16 md:mb-20 reveal-block">
          <span className="section-eyebrow mb-5">Sobre o salão</span>
          <h2 className="section-title mt-4">
            Sobre a <span className="section-title-accent">Bianca Alves</span>
          </h2>
          <div className="section-divider" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="order-2 lg:order-1 reveal-block">
            <div className="relative">
              <div
                className="absolute -inset-5 bg-gradient-rose opacity-10 rounded-[2.5rem] blur-3xl"
                aria-hidden="true"
              />
              <div className="absolute -left-4 -top-4 w-20 h-20 rounded-3xl border-t-2 border-l-2 border-brand-pink/30 pointer-events-none" aria-hidden="true" />
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-3xl border-b-2 border-r-2 border-brand-roseGold/30 pointer-events-none" aria-hidden="true" />

              <div className="relative image-premium aspect-[4/5]">
                {hasImage ? (
                  <img
                    src={salonConfig.aboutImageUrl}
                    alt={`${salonConfig.shortName} - Foto do salão`}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="placeholder-image aspect-[4/5] w-full h-full">
                    <div className="placeholder-image-content flex-col gap-4">
                      <div className="w-16 h-16 rounded-full bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-brand-pink" />
                      </div>
                      <div className="text-center px-6">
                        <p className="text-brand-pink font-medium text-sm">Espaço reservado</p>
                        <p className="text-brand-white/40 text-xs mt-2">
                          Foto da Bianca ou do salão — adicionar URL em <code className="text-brand-pink/60">salonConfig.ts</code>
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-0 border border-brand-pink/10 rounded-2xl pointer-events-none" />
                    <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-brand-pink/30 rounded-tl-xl" aria-hidden="true" />
                    <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-brand-roseGold/30 rounded-br-xl" aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-7 reveal-block">
            <div className="space-y-5 text-brand-white/75 text-base sm:text-lg leading-relaxed-plus">
              {salonConfig.aboutText.split('\n').map((paragraph, idx) => (
                <p key={idx} className="text-pretty">{paragraph}</p>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              {[
                { label: 'Atendimento', value: 'Personalizado' },
                { label: 'Localização', value: salonConfig.address.city },
                { label: 'Agendamento', value: 'WhatsApp' },
              ].map((item) => (
                <div key={item.label} className="card card-hover text-center py-5">
                  <p className="font-display text-lg md:text-xl font-semibold bg-gradient-to-r from-brand-pink to-brand-roseGold bg-clip-text text-transparent mb-1">
                    {item.value}
                  </p>
                  <p className="text-brand-white/50 text-[11px] uppercase tracking-wide-md">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
