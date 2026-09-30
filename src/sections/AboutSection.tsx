import { Camera } from 'lucide-react';
import { SectionWrapper } from '../components/SectionWrapper';
import { salonConfig } from '../salonConfig';

export const AboutSection = () => {
  const hasImage = Boolean(salonConfig.aboutImageUrl);

  return (
    <SectionWrapper id="sobre" className="relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">
            Sobre a <span className="section-title-accent">Bianca Alves</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-rose mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-rose opacity-10 rounded-3xl blur-2xl" aria-hidden="true" />
              <div className="relative">
                {hasImage ? (
                  <img
                    src={salonConfig.aboutImageUrl}
                    alt={`${salonConfig.shortName} - Foto do salão`}
                    className="w-full aspect-[4/5] object-cover rounded-2xl shadow-2xl"
                  />
                ) : (
                  <div className="placeholder-image aspect-[4/5]">
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
                    <div className="absolute inset-0 border border-brand-pink/10 rounded-xl pointer-events-none" />
                    <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-brand-pink/30 rounded-tl-xl" aria-hidden="true" />
                    <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-brand-roseGold/30 rounded-br-xl" aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <div className="space-y-6 text-brand-white/75 text-lg leading-relaxed">
              {salonConfig.aboutText.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6">
              {[
                { label: 'Atendimento', value: 'Personalizado' },
                { label: 'Localização', value: salonConfig.address.city },
                { label: 'Agendamento', value: 'WhatsApp' },
              ].map((item) => (
                <div key={item.label} className="card card-hover text-center">
                  <p className="text-brand-pink font-display text-lg font-semibold mb-1">
                    {item.value}
                  </p>
                  <p className="text-brand-white/50 text-xs uppercase tracking-wider">
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
