import { getLang } from '@/lib/lang';
import { getDictionary } from './dictionaries';
import Hero from '@/components/Landing/hero';

export default async function Page() { 
    
    const lang = await getLang();
    const t = await getDictionary(lang);
    return (
        <div className="">
                <Hero />
        </div>
    );
}
