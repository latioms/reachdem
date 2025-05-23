import { getLang } from '@/lib/lang';
import { getDictionary } from './dictionaries';
import Hero from '@/components/Landing/hero';
import Logos from '@/components/Landing/logos';

export default async function Page() {

	const lang = await getLang();
	const t = await getDictionary(lang);

	return (
		<div className="">
			<Hero dictionary={t.landing.hero}/>
			<Logos dictionary={t.landing.logos} />
		</div>
	);
}
