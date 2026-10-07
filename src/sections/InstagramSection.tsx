import { Instagram, ArrowUpRight, Sparkles, Heart, Camera, Scissors } from 'lucide-react';
import { SectionWrapper } from '../components/SectionWrapper';
import { salonConfig } from '../salonConfig';

export const InstagramSection = () => {
  const hasInstagram = Boolean(salonConfig.instagramUrl);

  if (!hasInstagram) return null;

  return (
    <SectionWrapper id="instagram" className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[420px] bg-gradient-to-br from-brand-pink/[0.06] via-brand-roseGold/[0.05] to-amber-500/[0.03] rounded-[3rem] blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-10 md:mb-12 reveal-block">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-brand-pink via-brand-roseGold to-amber-500 mb-5 shadow-rose">
            <Instagram className="w-6 h-6 md:w-7 md:h-7 text-brand-white" strokeWidth={2.1} />
          </div>
          <span className="section-eyebrow mb-5">
            <Sparkles className="w-3.5 h-3.5 inline-block -mt-0.5 mr-1.5 opacity-80" strokeWidth={2.4} />
            Siga de perto
          </span>
          <h2 className="section-title mt-4">
            Mais beleza, <span className="section-title-accent">inspiração e bastidores</span> todos os dias.
          </h2>
          <p className="section-subtitle mt-4 mb-0 max-w-2xl mx-auto">
            Acompanhe nossos trabalhos, novidades e bastidores do salão.
          </p>
          <div className="section-divider" />
        </div>

        <div className="rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-brand-blackSecondary/60 via-brand-black/40 to-brand-blackSecondary/60 backdrop-blur-sm shadow-soft-card overflow-hidden reveal-block">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="relative p-7 md:p-9 lg:p-10 border-b md:border-b-0 md:border-r border-white/[0.07]">
              <div className="absolute -top-20 -left-20 w-[280px] h-[280px] rounded-full bg-gradient-to-br from-brand-pink/25 to-brand-roseGold/15 blur-3xl opacity-60 pointer-events-none" aria-hidden="true" />

              <div className="relative flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-[76px] h-[76px] md:w-[88px] md:h-[88px] rounded-3xl bg-gradient-to-br from-brand-pink via-brand-roseGold to-amber-500 p-[2px]">
                    <div className="w-full h-full rounded-[calc(1.5rem-2px)] bg-brand-blackSecondary flex items-center justify-center overflow-hidden">
                      <img
                        src={salonConfig.logoPath || '/logo.jpeg'}
                        alt={`Logo ${salonConfig.shortName} — perfil oficial no Instagram`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                  <span className="absolute -bottom-1.5 -right-1.5 inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-rose border-[3px] border-brand-blackSecondary">
                    <Heart className="w-3 h-3 md:w-[14px] md:h-[14px] text-brand-white fill-brand-white" strokeWidth={2.1} />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-brand-white/70 text-[11px] md:text-xs font-semibold uppercase tracking-wide-sm mb-1.5">
                    Perfil oficial · verificado
                  </p>
                  <h3 className="font-display tracking-tight leading-[1.05] text-brand-white text-[1.75rem] md:text-[2.1rem] text-balance max-w-[18ch]">
                    Bianca Alves
                  </h3>
                  <a
                    href={salonConfig.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-1.5 text-brand-pink font-semibold text-sm md:text-base group"
                  >
                    <span className="tracking-wide">@{salonConfig.instagramUsername}</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.2} />
                  </a>
                </div>
              </div>

              <p className="relative mt-7 md:mt-8 text-brand-white/75 leading-relaxed text-[0.95rem] md:text-[1.02rem] max-w-[40ch] text-pretty">
                Veja novos <span className="text-brand-pink font-semibold">antes &amp; depois</span>,
                transformações capilares, dicas de cuidados e tudo que
                acontece nos bastidores do nosso salão.
              </p>

              <div className="relative mt-7 md:mt-8 grid grid-cols-3 gap-3 md:gap-4 max-w-[400px]">
                <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] px-3 py-3.5 md:px-4 md:py-4">
                  <Camera className="w-5 h-5 md:w-[22px] md:h-[22px] text-brand-pink mb-2" strokeWidth={2.1} />
                  <p className="font-display text-brand-white tracking-tight text-[1.25rem] md:text-[1.45rem] leading-none">
                    Diário
                  </p>
                  <p className="text-brand-white/55 text-[11px] md:text-xs font-medium mt-1 tracking-wide-sm">
                    de trabalhos
                  </p>
                </div>
                <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] px-3 py-3.5 md:px-4 md:py-4">
                  <Scissors className="w-5 h-5 md:w-[22px] md:h-[22px] text-brand-roseGold mb-2" strokeWidth={2.1} />
                  <p className="font-display text-brand-white tracking-tight text-[1.25rem] md:text-[1.45rem] leading-none">
                    Cortes
                  </p>
                  <p className="text-brand-white/55 text-[11px] md:text-xs font-medium mt-1 tracking-wide-sm">
                    &amp; colorações
                  </p>
                </div>
                <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] px-3 py-3.5 md:px-4 md:py-4">
                  <Heart className="w-5 h-5 md:w-[22px] md:h-[22px] text-brand-pinkLight mb-2" strokeWidth={2.1} />
                  <p className="font-display text-brand-white tracking-tight text-[1.25rem] md:text-[1.45rem] leading-none">
                    Dicas
                  </p>
                  <p className="text-brand-white/55 text-[11px] md:text-xs font-medium mt-1 tracking-wide-sm">
                    de beleza
                  </p>
                </div>
              </div>

              <div className="relative mt-8 md:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={salonConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary justify-center sm:justify-start"
                  aria-label="Abrir perfil oficial do Instagram de Bianca Alves em nova aba"
                >
                  <Instagram className="w-5 h-5" strokeWidth={2.1} />
                  Conhecer o Instagram
                  <ArrowUpRight className="w-4 h-4 opacity-80" strokeWidth={2.2} />
                </a>
                <a
                  href={salonConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary justify-center sm:justify-start"
                >
                  @{salonConfig.instagramUsername}
                </a>
              </div>
            </div>

            <div className="relative p-7 md:p-9 lg:p-10 overflow-hidden">
              <div className="absolute -bottom-28 -right-28 w-[320px] h-[320px] rounded-full bg-gradient-to-tr from-brand-roseGold/25 via-brand-pink/20 to-transparent blur-3xl opacity-70 pointer-events-none" aria-hidden="true" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,138,162,0.08)_0%,transparent_55%)]" aria-hidden="true" />

              <div className="relative">
                <p className="section-eyebrow mb-4">O que você vai encontrar</p>

                <ul className="space-y-4 md:space-y-[18px]">
                  {[
                    {
                      label: 'Antes & depois de transformações reais',
                      accent: 'Cada resultado único, feito sob medida.',
                      icon: Heart,
                    },
                    {
                      label: 'Bastidores do atendimento no salão',
                      accent: 'Nosso processo do início ao fim.',
                      icon: Camera,
                    },
                    {
                      label: 'Tendências e dicas capilares',
                      accent: 'Para cuidar do cabelo no dia a dia.',
                      icon: Scissors,
                    },
                    {
                      label: 'Novidades e promoções primeiro',
                      accent: 'Quem segue por lá, recebe antes.',
                      icon: Sparkles,
                    },
                  ].map((item) => (
                    <li key={item.label} className="flex items-start gap-4 reveal-block" style={{ transitionDelay: '80ms' }}>
                      <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-brand-pink/18 to-brand-roseGold/18 border border-brand-pink/25 text-brand-pink">
                        <item.icon className="w-4.5 h-4.5 md:w-5 md:h-5" strokeWidth={2.1} />
                      </span>
                      <span className="min-w-0">
                        <p className="text-brand-white font-semibold leading-snug text-[0.98rem] md:text-[1.04rem] text-balance">
                          {item.label}
                        </p>
                        <p className="text-brand-white/55 text-sm md:text-[0.92rem] leading-relaxed mt-1 text-pretty">
                          {item.accent}
                        </p>
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="relative mt-8 md:mt-9 rounded-2xl border border-white/[0.08] bg-brand-black/40 backdrop-blur-sm p-5 md:p-6">
                  <p className="text-brand-pinkLight font-semibold text-xs md:text-[11px] uppercase tracking-wide-md mb-2">
                    Um convite
                  </p>
                  <p className="font-display text-brand-white tracking-tight leading-[1.15] text-[1.125rem] md:text-[1.3rem] max-w-[28ch] text-balance">
                    Vamos combinar? O próximo <span className="bg-gradient-to-r from-brand-pink via-brand-pinkLight to-brand-roseGold bg-clip-text text-transparent">cabelo dos sonhos</span> pode começar por ali.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
