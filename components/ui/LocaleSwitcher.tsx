'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';
import { setLang } from '@/app/actions/setLang';

// Define supported locales
const LOCALES = ['en', 'fr'];

export default function LocaleSwitcher() {
    const params = useParams();
    const [locale, setLocale] = useState<string>('en');

    useEffect(() => {
        if (params.locale) {
            setLocale(params.locale as string);
            setLang(params.locale as 'fr' | 'en'); // Set the locale in cookies
        }
    }, [params.locale]);

    // Create options array for the dropdown
    const options = LOCALES.map(curLocale => ({
        value: curLocale,
        label: curLocale.toUpperCase()
    }));

    return (
        <LocaleSwitcherSelect
            defaultValue={locale}
            label="Change language"
            options={options}  
        />
    );
}
