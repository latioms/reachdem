'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import checkAuth from '@/app/actions/chechAuth';

interface NavbarProps {
  dictionary?: any;
}

export default function Navbar({ dictionary }: NavbarProps) {
  const t = dictionary || {}

  const navLinks = [
    { href: '/about', label: t.about || 'About' },
    { href: '/pricing', label: t.pricing || 'Pricing' },
    { href: '/faq', label: t.faq || 'FAQ' },
    { href: '/contact', label: t.contact || 'Contact' },
  ];
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const authStatus = await checkAuth();
        setIsLoggedIn(authStatus.isAuthenticated);
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsLoggedIn(false);
      }
    };
    fetchAuthStatus();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsLoggedIn(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm'
          : 'bg-background/60 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-0">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              ReachDem
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isLoggedIn && (
            <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                >
                  {t.login || 'Login'}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {t.getStarted || 'Get Started'}
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="User menu"
                >
                  <User className="h-5 w-5" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-popover p-1 shadow-lg">
                    <Link
                      href="/dashboard"
                      className="flex w-full rounded-lg px-3 py-2 text-sm text-popover-foreground hover:bg-accent"
                    >
                      {t.dashboard || 'Dashboard'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                    >
                      {t.logout || 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <div className="flex w-4 flex-col items-center gap-[5px]">
                <span
                  className={`block h-[1.5px] w-full rounded-full bg-foreground transition-all duration-300 ${
                    isMobileMenuOpen ? 'translate-y-[6.5px] rotate-45' : ''
                  }`}
                />
                <span
                  className={`block h-[1.5px] w-full rounded-full bg-foreground transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block h-[1.5px] w-full rounded-full bg-foreground transition-all duration-300 ${
                    isMobileMenuOpen ? '-translate-y-[6.5px] -rotate-45' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-1">
          {!isLoggedIn &&
            navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          {!isLoggedIn && (
            <div className="mt-4 flex flex-col gap-2 border-t border-border/50 pt-4">
              <Link
                href="/login"
                className="rounded-lg px-4 py-3 text-center text-base font-medium text-foreground transition-colors hover:bg-accent"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.login || 'Login'}
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-3 text-center text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.getStarted || 'Get Started'}
              </Link>
            </div>
          )}
          {isLoggedIn && (
            <>
              <Link
                href="/dashboard"
                className="block rounded-lg px-4 py-3 text-base text-foreground hover:bg-accent"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.dashboard || 'Dashboard'}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full rounded-lg px-4 py-3 text-left text-base text-destructive hover:bg-destructive/10"
              >
                {t.logout || 'Logout'}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
