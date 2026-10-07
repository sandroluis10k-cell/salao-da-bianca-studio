import { Star, Quote } from 'lucide-react';
import { SectionWrapper } from '../components/SectionWrapper';
import { salonConfig } from '../salonConfig';

export const ReviewsSection = () => {
  const hasGoogleUrl = Boolean(salonConfig.googleReviewUrl);
  const reviews = salonConfig.reviews;
  const hasReviews = reviews.length > 0;

  return (
    <SectionWrapper id="avaliacoes" className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] bg-brand-roseGold/[0.05] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16 md:mb-20 reveal-block">
          <span className="section-eyebrow mb-5">Opiniões de quem já foi</span>
          <h2 className="section-title mt-4">
            Avalie nosso <span className="section-title-accent">atendimento</span>
          </h2>
          <p className="section-subtitle mt-6">
            Já foi atendida pela Bianca Alves? Compartilhe sua experiência e ajude outras pessoas a conhecerem nosso trabalho.
          </p>
          <div className="section-divider" />
        </div>

        {hasReviews && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-12">
            {reviews.slice(0, 4).map((review, idx) => (
              <div
                key={review.id}
                className="card card-hover relative reveal-block"
                style={{ transitionDelay: `${Math.min(idx * 60, 240)}ms` }}
              >
                <div className="absolute top-0 left-0 w-1 h-full rounded-l-3xl bg-gradient-to-b from-brand-pink to-brand-roseGold opacity-70" aria-hidden="true" />
                <div className="flex items-start justify-between mb-5 pl-1">
                  <Quote className="w-8 h-8 text-brand-pink/30 shrink-0" strokeWidth={1.7} />
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-brand-pink fill-brand-pink'
                            : 'text-brand-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-brand-white/80 text-[15px] leading-relaxed-plus mb-6 pl-1">
                  "{review.text}"
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.07] pl-1">
                  <p className="text-brand-white font-medium text-sm">{review.author}</p>
                  {review.date && (
                    <p className="text-brand-white/40 text-xs tracking-wide">{review.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center reveal-block">
          {hasGoogleUrl ? (
            <a
              href={salonConfig.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <Star className="w-5 h-5 fill-brand-white" />
              Avaliar no Google
            </a>
          ) : (
            <div className="inline-flex items-center gap-4 px-6 sm:px-8 py-5 rounded-3xl bg-brand-black/70 backdrop-blur-sm border border-brand-pink/10 shadow-soft-card">
              <Star className="w-5 h-5 text-brand-pink shrink-0" strokeWidth={2.1} />
              <p className="text-brand-white/55 text-sm text-left text-pretty">
                Link do Google pendente — ative em <code className="text-brand-pink/70 font-mono text-[12px]">salonConfig.ts</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
};
