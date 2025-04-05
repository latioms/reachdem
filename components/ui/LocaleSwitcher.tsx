import { useLocale, useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';

export default function LocaleSwitcher() {
    const t = useTranslations('LocaleSwitcher');
    const locale = useLocale();

    // Create options array for the dropdown
    const options = routing.locales.map(curLocale => ({
        value: curLocale,
        label: curLocale.toUpperCase()  // Or you can use t('locale', {locale: curLocale}) for localized names
    }));

    return (
        <LocaleSwitcherSelect
            defaultValue={locale}
            label={t('label')}
            options={options}  
        />
    );
}
