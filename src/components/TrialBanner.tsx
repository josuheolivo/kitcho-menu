'use client';

import { SparkIcon } from '@/components/Icons';

export default function TrialBanner({ message }: { message: string }) {
  return <div className="border-b border-amber-200 bg-[#fff8db] px-4 py-2.5 text-center text-sm font-medium text-[#795500]"><span className="inline-flex items-center gap-2"><SparkIcon className="h-4 w-4" />{message}</span></div>;
}
