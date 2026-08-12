'use client';

interface TrialBannerProps {
  message: string;
}

export default function TrialBanner({ message }: TrialBannerProps) {
  return (
    <div className="bg-[var(--kitcho-yellow)] text-[var(--kitcho-charcoal)] text-center py-2.5 px-4 text-sm font-semibold">
      <span className="mr-1.5">⚡</span>
      {message}
    </div>
  );
}
