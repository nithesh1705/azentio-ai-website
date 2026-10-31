import { NextRequest, NextResponse } from 'next/server';
import { getAdminOrganisationById, updateAdminOrganisation } from '@/server/dal/admin/orgs';
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

    const details = getAdminOrganisationById(actor, id);
    if (!details) {
      return NextResponse.json({ success: false, error: 'Organisation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...details });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 403 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const actor: Actor = body.actor || {
      userId: 'usr-admin-max',
      name: 'Max Verstappen',
      email: 'max_verstappen@azentio.com',
      platformGrants: ['portal_admin'],
      memberships: [],
      activeTenantId: null,
      isVerifiedEmployee: true,
    };

    const updated = updateAdminOrganisation(actor, id, body);
    return NextResponse.json({ success: true, organisation: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

