import { NextResponse } from 'next/server';
import { loadUsers, saveUsers, hashPassword } from '@/lib/backend-state';

export async function PUT(request, { params }) {
  try {
    const id = Number(params.id);
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === id);
    
    if (idx === -1) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden.' }, { status: 404 });
    }

    const { password, name, role, active } = await request.json() || {};
    
    if (name !== undefined) users[idx].name = name.trim();
    if (role !== undefined) users[idx].role = role === 'admin' ? 'admin' : 'distributor';
    if (active !== undefined) users[idx].active = Boolean(active);
    if (password) users[idx].password = hashPassword(password);

    saveUsers(users);

    const { password: _pw, ...safeUser } = users[idx];
    return NextResponse.json(safeUser);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = Number(params.id);
    const users = loadUsers();
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden.' }, { status: 404 });
    }
    
    if (user.username === 'admin') {
      return NextResponse.json({ error: 'Admin kann nicht gelöscht werden.' }, { status: 403 });
    }

    saveUsers(users.filter(u => u.id !== id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
