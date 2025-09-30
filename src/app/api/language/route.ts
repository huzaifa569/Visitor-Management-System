import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { language } = await req.json();

  if (!language) {
    return NextResponse.json({ message: 'Language not provided' }, { status: 400 });
  }

  const response = NextResponse.json({ message: 'Language updated successfully' });

//   response.headers.set(
//     'Set-Cookie',
//     `lang=${language}; Path=/; HttpOnly; Max-Age=31536000`
//   );
  response.headers.set(
  'Set-Cookie',
  `lang=${language}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`
);


  return response;
}
