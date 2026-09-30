import { Instagram } from 'lucide-react';
import { SectionWrapper } from '../components/SectionWrapper';
import { salonConfig } from '../salonConfig';

export const InstagramSection = () => {
  const hasInstagram = Boolean(salonConfig.instagramUrl);

  if (!hasInstagram) return null;

  const posts = [1, 2, 3, 4, 5, 6];

  return (
    <SectionWrapper id="instagram">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-pink via-brand-roseGold to-amber-500 mb-5 shadow-gold">
            <Instagram className="w-6 h-6 text-brand-white" />
          </div>
          <h2 className="section-title mb-4">
            Siga-nos no <span className="section-title-accent">Instagram</span>
          </h2>
          {salonConfig.instagramUsername && (
            <p className="text-brand-pink font-medium mb-2">
              @{salonConfig.instagramUsername}
            </p>
          )}
          <p className="text-brand-white/60 text-center max-w-2xl mx-auto mb-4">
            Acompanhe nossos trabalhos, novidades e bastidores do salão.
          </p>
          <div className="w-20 h-1 bg-gradient-rose mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-3 gap-1.5 md:gap-3 mb-10 rounded-2xl overflow-hidden bg-brand-blackSecondary border border-white/5 p-1.5 md:p-3">
          {posts.map((post) => (
            <div
              key={post}
              className="aspect-square relative rounded-lg overflow-hidden bg-gradient-to-br from-brand-pink/5 via-brand-blackSecondary to-brand-roseGold/5 group cursor-pointer"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-brand-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Instagram className="w-4 h-4 md:w-6 md:h-6 text-brand-white" />
                </div>
              </div>
              <div className="absolute top-2 left-2 text-[10px] md:text-xs text-brand-pink/40">
                #{post}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href={salonConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <Instagram className="w-5 h-5" />
            Conhecer o Instagram
          </a>
        </div>
      </div>
    </SectionWrapper>
  );
};
