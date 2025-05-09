'use client';

import clsx from 'clsx';
import { useParams } from 'next/navigation';
import { useTransition, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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

  function handleLocaleChange(nextLocale: string) {
    setCurrentLocale(nextLocale);
    setIsOpen(false);
    
    // Update the URL to include the new locale
    startTransition(() => {
      // Create new path by replacing the current locale segment
      const newPathname = pathname?.replace(`/${params.locale}`, `/${nextLocale}`) || `/${nextLocale}`;
      router.push(newPathname);
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
              onClick={() => handleLocaleChange(option.value)}
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
