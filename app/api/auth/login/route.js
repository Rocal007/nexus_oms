import { NextResponse } from 'next/server';
import { loadUsers, hashPassword } from '@/lib/backend-state';

export async function POST(request) {
  try {
    const { username, password } = await request.json() || {};
    if (!username || !password) {
      return NextResponse.json({ ok: false, error: 'Benutzername und Passwort erforderlich.' }, { status: 400 });
    }

    const user = loadUsers().find(
      u => u.username.toLowerCase() === username.toLowerCase() && 
           u.password === hashPassword(password) && 
           u.active
    );

    if (!user) {
      return NextResponse.json({ ok: false, error: 'Ungültige Anmeldedaten oder Konto inaktiv.' }, { status: 401 });
    }

    const token = Buffer.from(`${user.id}:${user.username}:${Date.now()}`).toString('base64');
    const { password: _pw, ...safeUser } = user;

    return NextResponse.json({ ok: true, user: safeUser, token });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
