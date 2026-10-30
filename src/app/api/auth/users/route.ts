import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/server/dal/store';

export async function GET() {
  const users = getAllUsers();
  return NextResponse.json({ users });
}

