import Link from 'next/link';

interface BrandMarkProps {
  href?: string;
  compact?: boolean;
  className?: string;
}

export default function BrandMark({ href = '/', compact = false, className = '' }: BrandMarkProps) {
  const content = (
    <>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 6.5v19M9 16h3.5L21 6.5M12.5 16 22 25.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {!compact && <span className="brand-name">Kitcho <em>Menu</em></span>}
    </>
  );

  return (
    <Link href={href} className={`brand ${className}`} aria-label="Kitcho Menu, inicio">
      {content}
    </Link>
  );
}
