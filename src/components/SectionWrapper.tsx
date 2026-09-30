import { ReactNode } from 'react';

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export const SectionWrapper = ({ id, children, className = '' }: SectionWrapperProps) => {
  return (
    <section id={id} className={`py-20 md:py-28 scroll-mt-20 ${className}`}>
      <div className="container-page">
        {children}
      </div>
    </section>
  );
};
