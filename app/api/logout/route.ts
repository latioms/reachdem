import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  // Delete the auth cookie
  (await cookies()).delete('reachdem-session');
  
  // Revalidate the layout paths to force refresh
  revalidatePath('/[locale]', 'layout');
  revalidatePath('/', 'layout');
  
  // rediriger vers la page de login
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}
