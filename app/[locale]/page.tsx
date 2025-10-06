import { getLang } from '@/lib/lang';
import { getDictionary } from './dictionaries';
import Hero from '@/components/Landing/hero';
import checkAuth from '../actions/chechAuth';
import { redirect } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import CookingLanding from '@/components/cooking/CookingLanding';

type Props = {
  params: Promise<{ lang: "en" | "fr" }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const lang = (await params).lang;
  const dict = await getDictionary(lang);
  
  // Utiliser les valeurs de la Hero section
  const title = dict.landing.hero.title;
  const description = dict.landing.hero.subtitle;
  
  // Récupérer les images parentes si nécessaire
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ['/images/reachdem.png', ...previousImages],
      locale: lang,
    },
    twitter: {
      title,
      description,
      images: ['/images/reachdem.png'],
      card: 'summary_large_image',
    },
    alternates: {
      languages: {
        'en': '/en',
        'fr': '/fr',
      },
    },
  }
}

export default async function Page() {
	const lang = await getLang();
	
	// Check if user is authenticated and redirect to dashboard
	const { isAuthenticated } = await checkAuth();
	
	if (isAuthenticated) {
		redirect(`/${lang}/dashboard`);
	}

	const t = await getDictionary(lang);
	
	return (
			<CookingLanding />
	);
}
