import { useEffect, useRef } from 'react';
import { Instagram, ArrowUpRight, Sparkles, Play, Zap, Gift, Eye, CalendarCheck } from 'lucide-react';
import { SectionWrapper } from '../components/SectionWrapper';
import { salonConfig, openBooking } from '../salonConfig';

/**
 * Seção do Instagram pensada para levar a cliente ao perfil:
 * - curiosidade: prévias dos vídeos com "veja o resultado completo"
 * - exclusividade: novidades e horários extras saem primeiro nos Stories
 * - reciprocidade: dicas gratuitas
 * - baixo atrito: botão de seguir em destaque, "leva 2 segundos"
 */

const REELS = [
  { src: '/Videos/video-01.mp4', hook: 'Progressiva: do frizz ao liso espelhado', tag: 'Antes & depois' },
  { src: '/Videos/video-02.mp4', hook: 'Hidratação que devolve o brilho', tag: 'Transformação' },
  { src: '/Videos/video-03.mp4', hook: 'Coloração do jeitinho que ela pediu', tag: 'Resultado real' },
  { src: '/Videos/video-04.mp4', hook: 'Escova com acabamento de salão', tag: 'Bastidores' },
];

const PERKS = [
  { icon: Zap, title: 'Horários extras primeiro', text: 'Encaixes e vagas de última hora saem antes nos Stories.' },
  { icon: Gift, title: 'Promoções só para seguidoras', text: 'Condições especiais que não aparecem em outro lugar.' },
  { icon: Eye, title: 'Antes & depois reais', text: 'Veja o resultado em clientes de verdade antes de agendar.' },
];

/** Vídeo que só toca quando aparece na tela (economiza internet) */
const ReelPreview = ({ src }: { src: string }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => undefined);
        else v.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
};

export const InstagramSection = () => {
  if (!salonConfig.instagramUrl) return null;
  const url = salonConfig.instagramUrl;
  const handle = `@${salonConfig.instagramUsername}`;

  return (
    <SectionWrapper id="instagram" className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[760px] h-[460px] bg-gradient-to-br from-brand-pink/[0.07] via-brand-roseGold/[0.05] to-amber-500/[0.04] rounded-[3rem] blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Título */}
        <div className="text-center mb-10 md:mb-12 reveal-block">
          <span className="section-eyebrow mb-5">
            <Sparkles className="w-3.5 h-3.5 inline-block -mt-0.5 mr-1.5 opacity-80" strokeWidth={2.4} />
            Bastidores no Instagram
          </span>
          <h2 className="section-title mt-4">
            Veja <span className="section-title-accent">transformações reais</span> antes de agendar
          </h2>
          <p className="section-subtitle mt-4 mb-0">
            Toda semana tem resultado novo, dica de cuidado e novidade do salão. O próximo pode ser o seu.
          </p>
          <div className="section-divider" />
        </div>

        {/* Barra do perfil */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mx-auto mb-8 md:mb-10 flex max-w-xl items-center gap-4 rounded-full border border-white/10 bg-brand-blackSecondary/70 p-2 pr-3 sm:pr-2 backdrop-blur-sm transition-colors hover:border-brand-pink/40 reveal-block"
        >
          <span className="relative shrink-0 rounded-full bg-gradient-to-tr from-amber-400 via-brand-pink to-fuchsia-600 p-[2.5px]">
            <span className="block rounded-full bg-brand-black p-[2px]">
              <img src={salonConfig.logoPath} alt="" className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover" loading="lazy" />
            </span>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-md bg-gradient-to-r from-brand-pink to-fuchsia-600 px-1.5 text-[9px] font-bold uppercase tracking-wide text-white">
              Novo
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-brand-white">{salonConfig.shortName}</span>
            <span className="block truncate text-sm text-brand-pink">{handle}</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-5 py-2.5 text-sm font-semibold text-white shadow-rose transition-transform group-hover:scale-[1.03]">
            <Instagram className="w-4 h-4" /> Seguir
          </span>
          <ArrowUpRight className="sm:hidden w-5 h-5 text-brand-pink" />
        </a>

        {/* Prévias dos reels */}
        <div className="-mx-5 sm:mx-0 overflow-x-auto sm:overflow-visible snap-x snap-mandatory reveal-block" style={{ scrollbarWidth: 'none' }}>
          <div className="flex sm:grid sm:grid-cols-5 gap-3 md:gap-4 px-5 sm:px-0 pb-2">
            {REELS.map((r) => (
              <a
                key={r.src}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${r.hook} — ver no Instagram`}
                className="group relative aspect-[9/16] w-[62%] sm:w-auto shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-brand-blackSecondary"
              >
                <ReelPreview src={r.src} />
                <span className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/10 to-brand-black/30" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-black/55 px-2.5 py-1 text-[11px] font-semibold text-brand-white backdrop-blur">
                  <Play className="w-3 h-3 fill-current" /> {r.tag}
                </span>
                <span className="absolute inset-x-0 bottom-0 p-4">
                  <span className="block font-display text-[1.05rem] leading-snug text-brand-white text-balance">{r.hook}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-pinkLight">
                    Ver resultado completo <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </span>
              </a>
            ))}

            {/* Cartão final: curiosidade + chamada */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-[9/16] w-[62%] sm:w-auto shrink-0 snap-center overflow-hidden rounded-3xl border border-brand-pink/30"
            >
              <img
                src={salonConfig.heroImageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover blur-[6px] scale-110 opacity-60"
                loading="lazy"
              />
              <span className="absolute inset-0 bg-gradient-to-br from-brand-pink/70 via-brand-roseGold/70 to-fuchsia-900/80" />
              <span className="relative flex h-full flex-col items-center justify-center p-5 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <Instagram className="w-7 h-7 text-white" />
                </span>
                <span className="mt-4 font-display text-xl leading-tight text-white">Tem muito mais lá</span>
                <span className="mt-2 text-sm text-white/85">Novos antes & depois toda semana</span>
                <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-black transition-transform group-hover:scale-105">
                  Ver perfil <ArrowUpRight className="w-4 h-4" />
                </span>
              </span>
            </a>
          </div>
        </div>

        {/* Por que seguir */}
        <div className="mt-10 grid gap-3 sm:grid-cols-3 reveal-block">
          {PERKS.map((p) => (
            <div key={p.title} className="flex gap-3 rounded-2xl border border-white/[0.07] bg-brand-blackSecondary/60 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-pink/20 to-brand-roseGold/20 text-brand-pink">
                <p.icon className="w-5 h-5" strokeWidth={2.1} />
              </span>
              <span>
                <span className="block font-semibold text-brand-white">{p.title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-brand-white/60">{p.text}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Chamada final */}
        <div className="mt-10 flex flex-col items-center gap-3 text-center reveal-block">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-7 py-3.5 font-semibold text-white shadow-rose transition-transform hover:scale-[1.03]"
            >
              <Instagram className="w-5 h-5" /> Seguir {handle}
            </a>
            <button
              type="button"
              onClick={() => openBooking()}
              className="btn-secondary justify-center"
            >
              <CalendarCheck className="w-5 h-5" /> Já quero agendar
            </button>
          </div>
          <p className="text-xs text-brand-white/45">Leva 2 segundos e você não perde nenhuma vaga extra 💖</p>
        </div>
      </div>
    </SectionWrapper>
  );
};
