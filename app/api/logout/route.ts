import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  // Delete the auth cookie
  (await cookies()).delete('reachdem-session');
  return NextResponse.json({ success: true });
}
