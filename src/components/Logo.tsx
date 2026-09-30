import { salonConfig } from '../salonConfig';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const sizeMap = {
  sm: { height: 'h-9' },
  md: { height: 'h-12' },
  lg: { height: 'h-24' },
  xl: { height: 'h-40 md:h-48' },
};

export const Logo = ({ size = 'md', showText = false }: LogoProps) => {
  const s = sizeMap[size];

  return (
    <a href="#inicio" className="group inline-flex items-center justify-center" aria-label={salonConfig.name}>
      <div className={`relative ${s.height} transition-transform duration-300 group-hover:scale-[1.02]`}>
        <img
          src={salonConfig.logoPath}
          alt={`${salonConfig.name} - Logomarca`}
          className={`w-auto ${s.height} object-contain drop-shadow-[0_0_25px_rgba(183,110,121,0.35)]`}
          loading="eager"
        />
      </div>

      {showText && (
        <div className="sr-only">
          <span>{salonConfig.name}</span>
        </div>
      )}
    </a>
  );
};
