import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const text = await request.text();
    console.log('[CLIENT ERROR]', text);
    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    return new NextResponse('Error', { status: 500 });
  }
}
