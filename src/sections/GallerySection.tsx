import { useState } from 'react';
import { Image as ImageIcon, X, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionWrapper } from '../components/SectionWrapper';
import { salonConfig } from '../salonConfig';

const CATEGORIES = ['Progressiva', 'Hidratação', 'Coloração', 'Escova'] as const;
type Category = (typeof CATEGORIES)[number] | 'Todos';

export const GallerySection = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('Todos');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const items = salonConfig.gallery;
  const hasItems = items.length > 0;
  const hasInstagram = Boolean(salonConfig.instagramUrl);

  const filteredItems =
    activeCategory === 'Todos'
      ? items
      : items.filter((item) => item.category === activeCategory);

  const placeholderSlots = 8;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () =>
    setLightboxIndex((i) => (i === null ? null : (i - 1 + filteredItems.length) % filteredItems.length));
  const nextImage = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % filteredItems.length));

  return (
    <SectionWrapper id="trabalhos">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="section-title mb-4">
            Conheça nosso <span className="section-title-accent">trabalho</span>
          </h2>
          <p className="text-brand-white/60 text-center max-w-2xl mx-auto">
            {hasItems
              ? 'Uma seleção de resultados recentes. Fale conosco para mais referências.'
              : 'Em breve, fotos reais dos nossos trabalhos. Acompanhe pelo Instagram para ver novidades.'}
          </p>
          <div className="w-20 h-1 bg-gradient-rose mx-auto rounded-full mt-6" />
        </div>

        {hasItems && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <FilterButton
              active={activeCategory === 'Todos'}
              onClick={() => setActiveCategory('Todos')}
              label="Todos"
            />
            {CATEGORIES.filter((c) => items.some((i) => i.category === c)).map((cat) => (
              <FilterButton
                key={cat}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                label={cat}
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {hasItems
            ? filteredItems.map((item, idx) => (
                <button
                  key={item.id + idx}
                  onClick={() => openLightbox(idx)}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-brand-blackSecondary border border-white/5 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  aria-label={`Abrir imagem: ${item.title || 'Trabalho ' + (idx + 1)}`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title || `Trabalho ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 right-3 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.title && (
                      <p className="text-brand-white font-medium text-sm">{item.title}</p>
                    )}
                    {item.category && (
                      <p className="text-brand-pink text-xs mt-0.5">{item.category}</p>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 rounded-full bg-brand-black/60 backdrop-blur-sm flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-brand-white" />
                    </div>
                  </div>
                </button>
              ))
            : Array.from({ length: placeholderSlots }).map((_, idx) => (
                <div key={idx} className="placeholder-image aspect-square">
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

        {hasInstagram && (
          <div className="mt-12 text-center">
            <a
              href={salonConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <Instagram className="w-5 h-5" />
              Ver mais trabalhos no Instagram
            </a>
          </div>
        )}
      </div>

      {hasItems && lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[60] bg-brand-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Galeria ampliada"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 w-12 h-12 rounded-full bg-brand-blackSecondary border border-white/10 flex items-center justify-center text-brand-white hover:text-brand-pink transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {filteredItems.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 md:left-8 w-12 h-12 rounded-full bg-brand-blackSecondary border border-white/10 flex items-center justify-center text-brand-white hover:text-brand-pink transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 md:right-8 w-12 h-12 rounded-full bg-brand-blackSecondary border border-white/10 flex items-center justify-center text-brand-white hover:text-brand-pink transition-colors"
                aria-label="Próxima"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-w-5xl max-h-[85vh] w-full">
            <img
              src={filteredItems[lightboxIndex].imageUrl}
              alt={filteredItems[lightboxIndex].title || 'Imagem ampliada'}
              className="w-full h-full object-contain max-h-[85vh] rounded-xl"
            />
            {filteredItems[lightboxIndex].title && (
              <p className="text-brand-white text-center mt-4 font-medium">
                {filteredItems[lightboxIndex].title}
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
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
      active
        ? 'bg-gradient-rose text-brand-white shadow-rose'
        : 'bg-brand-blackSecondary text-brand-white/60 border border-white/5 hover:text-brand-pink hover:border-brand-pink/20'
    }`}
  >
    {label}
  </button>
);
