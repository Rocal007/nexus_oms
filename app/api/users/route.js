import { NextResponse } from 'next/server';
import { loadUsers, saveUsers, hashPassword } from '@/lib/backend-state';

export async function GET() {
  const users = loadUsers();
  const safeUsers = users.map(({ password: _pw, ...u }) => u);
  return NextResponse.json(safeUsers);
}

export async function POST(request) {
  try {
    const { username, password, name, role } = await request.json() || {};
    if (!username || !password || !name || !role) {
      return NextResponse.json({ error: 'username, password, name und role erforderlich.' }, { status: 400 });
    }

    const users = loadUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return NextResponse.json({ error: 'Benutzername bereits vergeben.' }, { status: 409 });
    }

    const newUser = {
      id: (Math.max(0, ...users.map(u => u.id)) + 1),
      username: username.trim(),
      password: hashPassword(password),
      name: name.trim(),
      role: role === 'admin' ? 'admin' : 'distributor',
      active: true,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    const { password: _pw, ...safeUser } = newUser;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
