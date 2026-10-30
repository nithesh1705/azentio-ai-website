import { NextRequest, NextResponse } from 'next/server';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '@/server/dal/store';
import { Actor } from '@/types';

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get('orgId');
  const all = getAllUsers();
  const users = orgId ? all.filter((u) => u.orgId === orgId) : all;
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actor, name, email, orgId, role } = body;

    const newUser = createUser(actor as Actor, {
      name,
      email,
      orgId,
      role,
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { actor, userId, name, email, orgId, role } = body;

    const updated = updateUser(actor as Actor, userId, {
      name,
      email,
      orgId,
      role,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { actor, userId } = body;

    deleteUser(actor as Actor, userId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

