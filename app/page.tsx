import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Home() {
    // You can modify the default locale as needed
    // get locale from cookies
    const lang = (await cookies()).get('NEXT_LOCALE')?.value ?? 'en';
    
    redirect(`/${lang}/cooking`);
}