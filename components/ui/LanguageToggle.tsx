'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { setLang } from '@/app/actions/setLang';

export default function LanguageToggle() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();
  const [isFrench, setIsFrench] = useState(false);

  useEffect(() => {
    if (params.locale) {
      setIsFrench(params.locale === 'fr');
    }
  }, [params.locale]);

  const handleLanguageToggle = (checked: boolean) => {
    const nextLocale = checked ? 'fr' : 'en';
    setIsFrench(checked);
    
    startTransition(() => {
      // Update cookie
      setLang(nextLocale);
      
      // Create new path by replacing the current locale segment
      const newPathname = pathname?.replace(`/${params.locale}`, `/${nextLocale}`) || `/${nextLocale}`;
      router.push(newPathname);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">EN</span>
      <Switch
        checked={isFrench}
        onCheckedChange={handleLanguageToggle}
        disabled={isPending}
        className="data-[state=checked]:bg-primary"
      />
      <span className="text-xs text-muted-foreground">FR</span>
    </div>
  );
}
