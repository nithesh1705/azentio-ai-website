import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserById } from '@/server/dal/admin/users';
import { Actor } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const actor: Actor = {
      userId: 'usr-admin-max',
      name: 'Max Verstappen',
      email: 'max_verstappen@azentio.com',
      platformGrants: ['portal_admin', 'content_publisher'],
      memberships: [],
      activeTenantId: null,
      isVerifiedEmployee: true,
    };

    const details = getAdminUserById(actor, id);
    if (!details) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...details });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 403 });
  }
}
