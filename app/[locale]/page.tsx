import { getLang } from '@/lib/lang';
import { getDictionary } from './dictionaries';

export  default async function Page() { 
    const lang = await getLang();
    
    const t = await getDictionary(lang);
    return (
        <div className="container">
            <h1>{t.hello}</h1>
            <p>{t.welcome}</p>
        </div>
    );
}
