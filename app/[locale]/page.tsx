import { getLang } from '@/lib/lang';
import { getDictionary } from './dictionaries';

export default async function Page() { 
    
    const lang = await getLang();
    const t = await getDictionary(lang);
    return (
        <div className="container">
                
        </div>
    );
}
