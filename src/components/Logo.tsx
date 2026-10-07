import { salonConfig } from '../salonConfig';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const sizeMap = {
  sm: { height: 'h-9 md:h-10' },
  md: { height: 'h-11 md:h-12 lg:h-14' },
  lg: { height: 'h-24 md:h-28' },
  xl: { height: 'h-36 md:h-44 lg:h-52' },
};

export const Logo = ({ size = 'md', showText = false }: LogoProps) => {
  const s = sizeMap[size];

  return (
    <a
      href="#inicio"
      className="group inline-flex items-center justify-center select-none"
      aria-label={salonConfig.name}
    >
      <div
        className={`relative ${s.height} transition-all duration-500 ease-out group-hover:scale-[1.03] group-hover:-translate-y-0.5`}
      >
        <div
          className="absolute -inset-2 rounded-[1.5rem] bg-gradient-rose opacity-0 blur-2xl transition-opacity duration-500 ease-out group-hover:opacity-25"
          aria-hidden="true"
        />
        <img
          src={salonConfig.logoPath}
          alt={`${salonConfig.name} - Logomarca`}
          className={`relative w-auto ${s.height} object-contain drop-shadow-[0_10px_30px_rgba(183,110,121,0.30)]`}
          loading="eager"
          decoding="async"
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
