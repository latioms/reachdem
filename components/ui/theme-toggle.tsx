'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-none bg-transparent hover:bg-accent/50 hover:text-accent-foreground size-9"
        aria-label="Toggle theme"
      >
        <div className="size-4" />
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-accent/50 hover:text-accent-foreground size-9"
      aria-label="Toggle theme"
    >
      <Moon className={`size-4 transition-all ${theme === 'dark' ? 'scale-0 rotate-90 hidden' : 'scale-100 ease-in'}`} />
      <Sun className={`size-4 transition-all ${theme === 'dark' ? 'scale-100 rotate-0 ease-in-out duration-300' : 'hidden scale-0 -rotate-90 ease-out'}`} />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
