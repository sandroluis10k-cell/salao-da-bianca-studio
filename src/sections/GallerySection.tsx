import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Play, Instagram, Video as VideoIcon } from 'lucide-react';
import { SectionWrapper } from '../components/SectionWrapper';
import { salonConfig } from '../salonConfig';

const CATEGORIES = ['Progressiva', 'Hidratação', 'Coloração', 'Escova'] as const;
type Category = (typeof CATEGORIES)[number] | 'Todos';

interface VideoItem {
  readonly id: string;
  readonly videoUrl: string;
  readonly title: string;
  readonly category?: string;
}

const VIDEO_ITEMS: readonly VideoItem[] = [
  { id: 'video-01', videoUrl: '/Videos/video-01.mp4', title: 'Trabalho realizado #1', category: 'Progressiva' },
  { id: 'video-02', videoUrl: '/Videos/video-02.mp4', title: 'Trabalho realizado #2', category: 'Hidratação'  },
  { id: 'video-03', videoUrl: '/Videos/video-03.mp4', title: 'Trabalho realizado #3', category: 'Coloração'   },
  { id: 'video-04', videoUrl: '/Videos/video-04.mp4', title: 'Trabalho realizado #4', category: 'Escova'      },
  { id: 'video-05', videoUrl: '/Videos/video-05.mp4', title: 'Trabalho realizado #5', category: 'Progressiva' },
] as const;

const ensureMuted = (v: HTMLVideoElement) => {
  try {
    if (!v.muted) v.muted = true;
    if (v.volume !== 0) v.volume = 0;
  } catch { /* noop */ }
};

export const GallerySection = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('Todos');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const galleryRef = useRef<HTMLDivElement | null>(null);
  const ioRef = useRef<IntersectionObserver | null>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement | null>(null);

  const items = salonConfig.gallery.length > 0 ? salonConfig.gallery : [];
  const hasItems = items.length > 0;
  const hasInstagram = Boolean(salonConfig.instagramUrl);
  const hasVideos = true;

  const filteredItems =
    activeCategory === 'Todos'
      ? items
      : items.filter((item) => item.category === activeCategory);

  const filteredVideos =
    activeCategory === 'Todos'
      ? VIDEO_ITEMS
      : VIDEO_ITEMS.filter((v) => v.category === activeCategory);

  const placeholderSlots = 8;

  const videoIndexById = (id: string) =>
    Math.max(0, VIDEO_ITEMS.findIndex((v) => v.id === id));

  const openLightboxByVideoId = (videoId: string) =>
    setLightboxIndex(videoIndexById(videoId));

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevMedia = () =>
    setLightboxIndex((i) => {
      if (i === null) return null;
      const len = hasItems ? filteredItems.length : VIDEO_ITEMS.length;
      return (i - 1 + len) % len;
    });
  const nextMedia = () =>
    setLightboxIndex((i) => {
      if (i === null) return null;
      const len = hasItems ? filteredItems.length : VIDEO_ITEMS.length;
      return (i + 1) % len;
    });

  const observeVideoElement = (videoEl: HTMLVideoElement | null) => {
    if (!ioRef.current || !videoEl) return;
    try { ioRef.current.observe(videoEl); } catch { /* noop */ }
  };

  const unobserveVideoElement = (videoEl: HTMLVideoElement | null) => {
    if (!ioRef.current || !videoEl) return;
    try {
      ioRef.current.unobserve(videoEl);
      videoEl.pause();
      if (videoEl.preload !== 'metadata') videoEl.preload = 'metadata';
    } catch { /* noop */ }
  };

  // IntersectionObserver: uma única instância ao longo da vida do componente.
  // Reobserva TODOS os vídeos atualmente no DOM sempre que a categoria muda.
  useEffect(() => {
    if (!galleryRef.current) return;

    if (ioRef.current) {
      try { ioRef.current.disconnect(); } catch { /* noop */ }
      ioRef.current = null;
    }

    // === CORREÇÃO SOMENTE: revelar novos .reveal-block renderizados após troca de filtro ===
    // O IO global do SectionWrapper roda APENAS no mount inicial (deps vazios).
    // Se um novo card (com className="reveal-block") for montado por filtro, ele
    // fica com opacity: 0 + translate3d(0,30px,0) e parece "tela escura".
    // Aqui, garantimos visibilidade imediata p/ qualquer reveal-block filho que
    // ainda NAO recebeu .is-visible do observer global.
    const revealAllNewBlocks = () => {
      if (!galleryRef.current) return;
      const blocks = galleryRef.current.querySelectorAll<HTMLElement>('.reveal-block:not(.is-visible)');
      blocks.forEach((b) => {
        // Força 1 frame de 'entered' após o flush do DOM (revela sem esperar novo IO).
        try { b.classList.add('is-visible'); } catch { /* noop */ }
      });
    };
    // Após o React pintar (microtask):
    Promise.resolve().then(revealAllNewBlocks);
    // Após próximo animation frame (garante contra timing edge case de hidratacao):
    const revealRafId = window.requestAnimationFrame(revealAllNewBlocks);
    // ==================================================================================

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (!video) return;

          ensureMuted(video);

          if (entry.isIntersecting) {
            if (video.preload !== 'auto') video.preload = 'auto';
            video.play().catch(() => { /* noop: autoplay bloqueado esperado */ });
          } else {
            try { video.pause(); } catch { /* noop */ }
            if (video.preload !== 'metadata') video.preload = 'metadata';
          }
        });
      },
      { threshold: 0.22, rootMargin: '80px 0px 80px 0px' },
    );

    ioRef.current = io;

    const reobserveAllCurrent = () => {
      revealAllNewBlocks();
      if (!galleryRef.current || !ioRef.current) return;
      const allVideos = galleryRef.current.querySelectorAll<HTMLVideoElement>('video[data-video-id]');
      allVideos.forEach((video) => {
        ensureMuted(video);
        try { ioRef.current!.observe(video); } catch { /* noop */ }
      });
    };

    // Reobserva no próximo microtask (após React aplicar a árvore do novo filtro)
    Promise.resolve().then(reobserveAllCurrent);

    // Observa adições/remunerações de DOM no container para garantir captura
    let rafId: number | null = null;
    const mo = new MutationObserver(() => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(reobserveAllCurrent);
    });
    mo.observe(galleryRef.current, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(revealRafId);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      mo.disconnect();
      try { io.disconnect(); } catch { /* noop */ }
      if (ioRef.current === io) ioRef.current = null;
    };
  }, [activeCategory, hasItems]);

  // Fechar lightbox ao apertar ESC + setar video lightbox sempre mudo
  useEffect(() => {
    if (lightboxIndex === null) {
      lightboxVideoRef.current = null;
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') nextMedia();
      else if (e.key === 'ArrowLeft') prevMedia();
    };
    window.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => {
      if (lightboxVideoRef.current) ensureMuted(lightboxVideoRef.current);
    }, 60);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
      if (lightboxVideoRef.current) {
        try { lightboxVideoRef.current.pause(); } catch { /* noop */ }
      }
    };
  }, [lightboxIndex]);

  const registerVideoRef = (id: string) => (el: HTMLVideoElement | null) => {
    if (el) {
      ensureMuted(el);
      if (el.getAttribute('data-video-id') !== id) {
        el.setAttribute('data-video-id', id);
      }
      observeVideoElement(el);
    }
  };

  const unregisterVideoRef = (id: string) => (el: HTMLVideoElement | null) => {
    if (el) {
      if (el.getAttribute('data-video-id') === id) {
        unobserveVideoElement(el);
        try { el.removeAttribute('data-video-id'); } catch { /* noop */ }
      }
    }
  };

  const videoRefCallback = (id: string) => (el: HTMLVideoElement | null) => {
    if (el) {
      registerVideoRef(id)(el);
    } else {
      // video desmontado: tenta encontrar o ultimo elemento observado com o id
      // e remove a observacao. A callback do ref so passa o mesmo elemento antigo.
      // Como nao temos acesso, confiamos no unobserve quando o MutationObserver detectar a remocao.
    }
  };

  const renderMediaGrid = () => {
    if (hasItems) {
      if (filteredItems.length === 0 && activeCategory !== 'Todos') {
        return (
          <div className="reveal-block">
            <EmptyState />
          </div>
        );
      }
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {filteredItems.map((item, idx) => (
            <button
              key={item.id + idx}
              onClick={() => openLightbox(idx)}
              className="group relative aspect-square rounded-2xl overflow-hidden media-frame bg-brand-blackSecondary border border-white/[0.07] focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2 focus:ring-offset-brand-black reveal-block"
              style={{ transitionDelay: `${Math.min(idx * 50, 300)}ms` }}
              aria-label={`Abrir imagem: ${item.title || 'Trabalho ' + (idx + 1)}`}
            >
              <img
                src={item.imageUrl}
                alt={item.title || `Trabalho ${idx + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/85 via-brand-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-3 left-3 right-3 text-left opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
                {item.title && (
                  <p className="text-brand-white font-medium text-sm">{item.title}</p>
                )}
                {item.category && (
                  <p className="text-brand-pink text-xs mt-1">{item.category}</p>
                )}
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                <div className="w-9 h-9 rounded-full bg-brand-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-brand-white" />
                </div>
              </div>
            </button>
          ))}
        </div>
      );
    }

    if (hasVideos) {
      if (filteredVideos.length === 0 && activeCategory !== 'Todos') {
        return (
          <div className="reveal-block">
            <EmptyState />
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredVideos.map((video, idx) => {
            const isHero = idx === 0;
            const className =
              isHero
                ? 'group relative sm:col-span-2 lg:col-span-2 aspect-video sm:aspect-[16/10] rounded-3xl overflow-hidden media-frame bg-brand-blackSecondary border border-white/[0.08] shadow-soft-card transition-all duration-500 focus-within:ring-2 focus-within:ring-brand-pink focus-within:ring-offset-2 focus-within:ring-offset-brand-black reveal-block'
                : 'group relative aspect-[4/5] sm:aspect-[3/4] rounded-3xl overflow-hidden media-frame bg-brand-blackSecondary border border-white/[0.07] hover:border-brand-pink/30 transition-all duration-500 focus-within:ring-2 focus-within:ring-brand-pink focus-within:ring-offset-2 focus-within:ring-offset-brand-black reveal-block';
            return (
              <button
                key={video.id}
                onClick={() => openLightboxByVideoId(video.id)}
                className={className}
                style={{ transitionDelay: `${Math.min(idx * 60, 300)}ms` }}
                aria-label={`Abrir vídeo: ${video.title}`}
              >
                <video
                  ref={videoRefCallback(video.id)}
                  data-video-id={video.id}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  disablePictureInPicture={false}
                  controlsList="nodownload nofullscreen noremoteplayback noaudiovolume"
                  onLoadedMetadata={(e) => ensureMuted(e.currentTarget)}
                  onVolumeChange={(e) => ensureMuted(e.currentTarget)}
                  onPlay={(e) => ensureMuted(e.currentTarget)}
                  className="w-full h-full object-cover transition-all duration-[1200ms] ease-out group-hover:scale-[1.05] group-hover:brightness-110 brightness-95 saturate-105"
                >
                  <source src={video.videoUrl} type="video/mp4" />
                </video>

                <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-gradient-to-t from-brand-black/80 via-brand-black/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500" />

                <div aria-hidden="true" className="absolute top-3 left-3 right-3 pointer-events-none flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-black/65 backdrop-blur-md border border-white/10 text-[11px] uppercase tracking-wide-md text-brand-pinkLight font-semibold">
                    <VideoIcon className="w-3.5 h-3.5 text-brand-pink" strokeWidth={2.1} />
                    {video.category || 'Trabalho'}
                  </span>
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-brand-white group-hover:bg-gradient-rose group-hover:border-transparent group-hover:scale-110 transition-all duration-500">
                    <Play className="w-[18px] h-[18px] fill-current" />
                  </span>
                </div>

                <div aria-hidden="true" className="absolute bottom-4 left-4 right-4 pointer-events-none text-left">
                  <p className="text-brand-white font-semibold text-sm md:text-base leading-tight drop-shadow-sm">
                    {video.title}
                  </p>
                  <p className="mt-1.5 text-brand-pinkLight/90 text-xs md:text-sm font-medium tracking-wide-sm">
                    {idx + 1 === 1
                      ? 'Destaque — confira o resultado completo'
                      : 'Trabalho realizado no salão'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {Array.from({ length: placeholderSlots }).map((_, idx) => (
          <div key={idx} className="placeholder-image aspect-square rounded-2xl reveal-block">
            <div className="placeholder-image-content flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-brand-pink" />
              </div>
              <p className="text-brand-white/30 text-xs text-center px-3">
                Foto do trabalho #{idx + 1}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const EmptyState = () => (
    <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-brand-blackSecondary/60 via-brand-black/30 to-brand-blackSecondary/60 backdrop-blur-sm shadow-soft-card p-8 md:p-12 text-center reveal-block">
      <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-brand-pink/15 to-brand-roseGold/15 border border-brand-pink/25 text-brand-pink mb-5">
        <VideoIcon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.1} />
      </div>
      <p className="section-eyebrow mb-3">
        {activeCategory !== 'Todos' ? `Categoria: ${activeCategory}` : 'Trabalhos'}
      </p>
      <h3 className="font-display text-brand-white tracking-tight leading-[1.1] text-[1.5rem] md:text-[1.75rem] max-w-[28ch] mx-auto text-balance">
        Em breve, novos trabalhos nesta categoria.
      </h3>
      <p className="text-brand-white/55 text-sm md:text-[0.95rem] leading-relaxed mt-4 max-w-[46ch] mx-auto text-pretty">
        Enquanto isso, explore os demais resultados em &quot;Todos&quot; ou acompanhe
        as novidades primeiro no Instagram oficial da Bianca Alves.
      </p>
      <div className="mt-6 md:mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setActiveCategory('Todos')}
          className="btn-primary"
        >
          <VideoIcon className="w-5 h-5" strokeWidth={2.1} />
          Ver todos os trabalhos
        </button>
        {hasInstagram && (
          <a
            href={salonConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <Instagram className="w-5 h-5" strokeWidth={2.1} />
            Ver novidades no Instagram
          </a>
        )}
      </div>
    </div>
  );

  // Lightbox sempre usa a fonte FIXA de 5 videos (VIDEO_ITEMS) quando estamos no modo videos,
  // ou a fonte filtrada de imagens (filteredItems) quando tem imagens cadastradas.
  // Nunca usa filteredVideos como fonte (evita indices inconsistentes após várias trocas).
  const lightboxItems = hasItems ? filteredItems : VIDEO_ITEMS;
  const activeItem = lightboxIndex !== null ? lightboxItems[lightboxIndex] ?? null : null;

  return (
    <SectionWrapper id="trabalhos" className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 -left-20 w-[500px] h-[500px] bg-brand-pink/[0.05] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-brand-roseGold/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-14 reveal-block">
          <span className="section-eyebrow mb-5">Nossos trabalhos</span>
          <h2 className="section-title mt-4">
            Conheça nosso <span className="section-title-accent">trabalho</span>
          </h2>
          <p className="section-subtitle mt-6">
            {hasItems
              ? 'Uma seleção de resultados recentes. Fale conosco para mais referências.'
              : hasVideos
                ? 'Confira vídeos reais dos nossos trabalhos. Cada resultado é único e personalizado.'
                : 'Em breve, fotos reais dos nossos trabalhos. Acompanhe pelo Instagram para ver novidades.'}
          </p>
          <div className="section-divider" />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10 md:mb-12 reveal-block">
          <FilterButton
            active={activeCategory === 'Todos'}
            onClick={() => setActiveCategory('Todos')}
            label="Todos"
          />
          {CATEGORIES.map((cat) => (
            <FilterButton
              key={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              label={cat}
            />
          ))}
        </div>

        <div ref={galleryRef}>
          {renderMediaGrid()}
        </div>

        {hasInstagram && (
          <div className="mt-12 md:mt-16 text-center reveal-block">
            <a
              href={salonConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <Instagram className="w-5 h-5" strokeWidth={2.1} />
              Ver mais trabalhos no Instagram
            </a>
          </div>
        )}
      </div>

      {activeItem && (
        <div
          className="fixed inset-0 z-[60] bg-brand-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`Visualizar: ${activeItem.title}`}
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-4 right-4 md:top-5 md:right-5 w-12 h-12 rounded-full bg-brand-blackSecondary/90 backdrop-blur border border-white/10 flex items-center justify-center text-brand-white hover:text-brand-pink hover:border-brand-pink/30 transition-all duration-300 z-10"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" strokeWidth={2.2} />
          </button>

          {lightboxItems.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                className="absolute left-2 md:left-6 w-12 h-12 rounded-full bg-brand-blackSecondary/90 backdrop-blur border border-white/10 flex items-center justify-center text-brand-white hover:text-brand-pink hover:border-brand-pink/30 transition-all duration-300 z-10"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6" strokeWidth={2.2} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                className="absolute right-2 md:right-6 w-12 h-12 rounded-full bg-brand-blackSecondary/90 backdrop-blur border border-white/10 flex items-center justify-center text-brand-white hover:text-brand-pink hover:border-brand-pink/30 transition-all duration-300 z-10"
                aria-label="Próxima"
              >
                <ChevronRight className="w-6 h-6" strokeWidth={2.2} />
              </button>
            </>
          )}

          <div
            className="max-w-5xl max-h-[86vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {'imageUrl' in activeItem ? (
              <img
                src={(activeItem as { imageUrl: string }).imageUrl}
                alt={activeItem.title || 'Imagem ampliada'}
                className="w-full h-auto max-h-[86vh] object-contain rounded-2xl mx-auto shadow-2xl"
              />
            ) : (
              <video
                ref={(el) => {
                  lightboxVideoRef.current = el;
                  if (el) ensureMuted(el);
                }}
                src={(activeItem as VideoItem).videoUrl}
                className="w-full h-auto max-h-[86vh] rounded-2xl mx-auto bg-black shadow-2xl border border-white/10"
                controls
                muted
                loop
                playsInline
                autoPlay
                preload="auto"
                disablePictureInPicture={false}
                controlsList="noremoteplayback noaudiovolume nodownload"
                onLoadedMetadata={(e) => ensureMuted(e.currentTarget)}
                onVolumeChange={(e) => ensureMuted(e.currentTarget)}
                onPlay={(e) => ensureMuted(e.currentTarget)}
              >
                <source src={(activeItem as VideoItem).videoUrl} type="video/mp4" />
              </video>
            )}
            {activeItem.title && (
              <p className="text-brand-white text-center mt-4 md:mt-5 font-medium text-pretty">
                {activeItem.title}
              </p>
            )}
            {activeItem.category && (
              <p className="text-brand-pink text-center mt-1 text-sm tracking-wide-sm">
                {activeItem.category}
              </p>
            )}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const FilterButton = ({ active, onClick, label }: FilterButtonProps) => (
  <button
    onClick={onClick}
    className={`chip-filter ${active ? 'chip-filter-active' : 'chip-filter-idle'}`}
  >
    {label}
  </button>
);
