import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { theme } = await req.json();

  if (theme && (theme === 'light' || theme === 'dark')) {
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    const cookieStore = await cookies();

    cookieStore.set('theme', theme, { expires: expires });

    return new Response(null, { status: 200, statusText: 'OK' });
  }

  return new Response(null, { status: 400, statusText: 'Bad Request' });
}
