import { Star, Quote } from 'lucide-react';
import { SectionWrapper } from '../components/SectionWrapper';
import { salonConfig } from '../salonConfig';

export const ReviewsSection = () => {
  const hasGoogleUrl = Boolean(salonConfig.googleReviewUrl);
  const reviews = salonConfig.reviews;
  const hasReviews = reviews.length > 0;

  return (
    <SectionWrapper id="avaliacoes" className="bg-brand-blackSecondary/50 relative">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-roseGold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">
            Avalie nosso <span className="section-title-accent">atendimento</span>
          </h2>
          <p className="text-brand-white/60 text-center max-w-2xl mx-auto">
            Já foi atendida pela Bianca Alves? Compartilhe sua experiência e ajude outras pessoas a conhecerem nosso trabalho.
          </p>
          <div className="w-20 h-1 bg-gradient-rose mx-auto rounded-full mt-6" />
        </div>

        {hasReviews && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {reviews.slice(0, 4).map((review) => (
              <div
                key={review.id}
                className="card card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <Quote className="w-8 h-8 text-brand-pink/30 shrink-0" />
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
                <p className="text-brand-white/80 text-sm leading-relaxed mb-5">
                  "{review.text}"
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <p className="text-brand-white font-medium text-sm">{review.author}</p>
                  {review.date && (
                    <p className="text-brand-white/40 text-xs">{review.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
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
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-brand-black/60 border border-brand-pink/10">
              <Star className="w-5 h-5 text-brand-pink shrink-0" />
              <p className="text-brand-white/50 text-sm">
                Link do Google pendente — botão ativado em <code className="text-brand-pink/60">salonConfig.ts</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
};
