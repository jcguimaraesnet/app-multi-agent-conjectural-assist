import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
}

export default function PageTitle({ title, subtitle, backHref, backLabel }: PageTitleProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>

      {backHref && backLabel && (
        <Link
          href={backHref}
          className="inline-flex items-center text-base font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-[5px]" />
          {backLabel}
        </Link>
      )}
    </div>
  );
}
