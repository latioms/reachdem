import {useTranslations} from 'next-intl';

export default function Page() { 

    const t = useTranslations();
    return (
        <div className="container">
            <h1>{t('hello')}</h1>
            <p>{t('welcome')}</p>
        </div>
    );
}