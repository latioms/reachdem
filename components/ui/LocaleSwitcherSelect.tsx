'use client';

import clsx from 'clsx';
import {useParams} from 'next/navigation';
import {ReactNode, useTransition, useState} from 'react';
import {Locale} from '@/i18n/routing';
import {usePathname, useRouter} from '@/i18n/navigation';
import { ChevronDown } from 'lucide-react';

type Props = {
  defaultValue: string;
  label: string;
  options: Array<{value: string, label: string}>;
};

export default function LocaleSwitcherSelect({
  defaultValue,
  label,
  options
}: Readonly<Props>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState(defaultValue);

  function handleLocaleChange(nextLocale: Locale) {
    setCurrentLocale(nextLocale);
    setIsOpen(false);
    
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        {pathname, params},
        {locale: nextLocale}
      );
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={clsx(
          "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-sm px-2 py-1 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-muted-foreground dark:text-gray-300 hover:bg-accent dark:hover:bg-gray-700",
          isPending && "opacity-30"
        )}
      >
        {currentLocale.toUpperCase()}
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-20 rounded-md border bg-background shadow-lg dark:bg-gray-800 dark:border-gray-700">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleLocaleChange(option.value as Locale)}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
