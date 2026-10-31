import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminOrganisations,
  createAdminOrganisation,
  updateAdminOrganisation,
  suspendAdminOrganisation,
  reactivateAdminOrganisation,
  requestArchiveOrganisation,
  exportOrganisationsCSV,
} from '@/server/dal/admin/orgs';
import { Actor } from '@/types';

function getActor(req: NextRequest, body?: any): Actor {
  if (body?.actor) return body.actor;
  return {
    userId: 'usr-admin-max',
    name: 'Max Verstappen',
    email: 'max_verstappen@azentio.com',
    platformGrants: ['portal_admin', 'content_publisher'],
    memberships: [],
    activeTenantId: null,
    isVerifiedEmployee: true,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const format = searchParams.get('format');

    const actor = getActor(req);

    if (format === 'csv') {
      const csv = exportOrganisationsCSV(actor);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="organisations_export.csv"',
        },
      });
    }

    const organisations = getAdminOrganisations(actor, { status, search });
    return NextResponse.json({ success: true, organisations });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = getActor(req, body);

    const newOrg = createAdminOrganisation(actor, {
      name: body.name,
      domain: body.domain,
      tier: body.tier || 'Standard',
      entitledOfferings: body.entitledOfferings || [],
    });

    return NextResponse.json({ success: true, organisation: newOrg });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = getActor(req, body);
    const { id, action, reason } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Organisation ID is required.' }, { status: 400 });
    }

    if (action === 'suspend') {
      const suspended = suspendAdminOrganisation(actor, id, reason || 'Administrative suspension', true);
      return NextResponse.json({ success: true, organisation: suspended });
    }

    if (action === 'reactivate') {
      const reactivated = reactivateAdminOrganisation(actor, id);
      return NextResponse.json({ success: true, organisation: reactivated });
    }

    if (action === 'request_archive') {
      const approvalReq = requestArchiveOrganisation(actor, id, reason || 'Archive requested by admin');
      return NextResponse.json({ success: true, approvalRequest: approvalReq });
    }

    // Standard update
    const updated = updateAdminOrganisation(actor, id, body.data || {});
    return NextResponse.json({ success: true, organisation: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
