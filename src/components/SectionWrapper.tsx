import { ReactNode, useEffect, useRef } from 'react';

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export const SectionWrapper = ({ id, children, className = '' }: SectionWrapperProps) => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    // Reativa sempre que o ID/className mudar (mesmo não sendo deps, é seguro com check abaixo)
    const reveals = section.querySelectorAll<HTMLElement>('.reveal-block');
    if (!('IntersectionObserver' in window)) {
      reveals.forEach((r) => r.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    reveals.forEach((r) => io.observe(r));

    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={`relative py-20 md:py-28 lg:py-32 scroll-mt-24 ${className}`}
    >
      <div className="container-page">
        {children}
      </div>
    </section>
  );
};
