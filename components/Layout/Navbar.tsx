'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, User, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import  checkAuth  from '@/app/actions/chechAuth'; // Import the checkAuth function

// Define navigation links
const navLinks = [
    { href: '/about', label: 'About us' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
];

export default function Navbar({ initialLang = 'en' }: { initialLang?: string }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentLang, setCurrentLang] = useState(initialLang);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    // Check authentication status on component mount
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

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLangChange = (lang: string) => {
        setCurrentLang(lang);
        setIsLangOpen(false);
        // Add logic for actual language change (e.g., update i18n context)
        console.log(`Language changed to: ${lang}`);
    };

    const handleLogout = async () => {
        // Add actual logout logic here
        console.log('User logged out');
        setIsUserMenuOpen(false);
        setIsLoggedIn(false);
        // Potentially redirect or update auth state
    };

    return (
        <header className="relative z-50 bg-sand-100 dark:bg-gray-900">
            <div className="max-w-9xl container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-3">
                    {/* Logo */}
                    <Link href="/" className="flex font-extrabold text-lg items-center gap-2">
                        <h1>ReachDem</h1>
                    </Link>

                    {/* Desktop Navigation - Hidden when logged in */}
                    {!isLoggedIn && (
                        <nav aria-label="Main" data-orientation="horizontal" dir="ltr" className="relative z-10 hidden flex-1 items-center justify-center gap-8 lg:flex">
                            <ul data-orientation="horizontal" className="group flex flex-1 list-none items-center justify-center space-x-1" dir="ltr">
                                {navLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="text-primary p-2 font-normal lg:text-base dark:text-white">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2.5">

                        {/* Language Switcher */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-sm px-2 py-1 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-muted-foreground dark:text-gray-300 hover:bg-accent dark:hover:bg-gray-700"
                            >
                                {currentLang.toUpperCase()}
                                <ChevronDown size={16} className={`transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isLangOpen && (
                                <div className="absolute right-0 mt-2 w-20 rounded-md border bg-background shadow-lg dark:bg-gray-800 dark:border-gray-700">
                                    <button onClick={() => handleLangChange('en')} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">EN</button>
                                    <button onClick={() => handleLangChange('fr')} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">FR</button>
                                </div>
                            )}
                        </div>

                        {!isLoggedIn ? (
                            <>
                                {/* Sign Up Button */}
                                {/* <Link href="/signup" className="hidden lg:block">
                                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 text-muted-foreground dark:text-gray-300">
                                        Sign up
                                    </button>
                                </Link> */}

                                {/* Login Button */}
                                <Link href="/login" className="transition-opacity duration-300 opacity-100">
                                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
                                        Start for Free
                                    </button>
                                </Link>
                            </>
                        ) : (
                            /* User Popover Button */
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground size-9 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                                >
                                    <User size={20} />
                                    <span className="sr-only">User menu</span>
                                </button>
                                
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-lg dark:bg-gray-800 dark:border-gray-700">
                                        <Link href="/dashboard" className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">
                                            Dashboard
                                        </Link>
                                        <button onClick={handleLogout} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600">
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Theme Toggle */}
                        <div className="transition-opacity duration-300 opacity-100">
                            <button
                                onClick={toggleTheme}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground size-9 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                                <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                                <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                                <span className="sr-only">Toggle theme</span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button 
                            onClick={toggleMobileMenu}
                            className="text-muted-foreground relative flex size-8 lg:hidden dark:text-gray-400"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Basic hamburger icon - add state/logic for open/close animation if needed */}
                            <div className="absolute top-1/2 left-1/2 block w-[18px] -translate-x-1/2 -translate-y-1/2">
                                <span className="absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out -translate-y-1.5" />
                                <span className="absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out" />
                                <span className="absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out translate-y-1.5" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu - Update visibility based on state */}
            <div className={`absolute inset-0 top-full container flex h-[calc(100vh-64px)] flex-col transition-all duration-300 ease-in-out lg:hidden ${
                isMobileMenuOpen ? 'visible opacity-100 translate-x-0' : 'invisible translate-x-full opacity-0'
            } bg-sand-100 dark:bg-gray-900`}>
                {/* Mobile Menu Content - Adapt based on isLoggedIn */}
                <div className="flex flex-col space-y-4 p-4">
                    {!isLoggedIn && navLinks.map((link) => (
                         <Link key={link.href} href={link.href} className="text-primary p-2 font-normal text-lg dark:text-white">
                             {link.label}
                         </Link>
                    ))}
                     {/* Add mobile versions of Login/Signup or Dashboard/Logout */}
                     {!isLoggedIn ? (
                        <>
                            <Link href="/login" className="text-primary p-2 font-normal text-lg dark:text-white">Login</Link>
                            <Link href="/signup" className="text-primary p-2 font-normal text-lg dark:text-white">Sign Up</Link>
                        </>
                     ) : (
                        <>
                             <Link href="/dashboard" className="text-primary p-2 font-normal text-lg dark:text-white">Dashboard</Link>
                             <button onClick={handleLogout} className="text-red-600 p-2 font-normal text-lg dark:text-red-400 text-left">Logout</button>
                        </>
                     )}
                </div>
            </div>
        </header>
    );
}
