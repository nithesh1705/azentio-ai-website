import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, getOrganisations } from '@/server/dal/store';

export async function GET() {
  const users = getAllUsers();
  const organisations = getOrganisations();
  return NextResponse.json({ users, organisations });
}

