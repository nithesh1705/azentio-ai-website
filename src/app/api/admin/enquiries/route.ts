import { NextRequest, NextResponse } from 'next/server';
import { Actor } from '@/types';
import {
  getAdminDemoEnquiries,
  getAdminHackathonRegistrations,
  updateDemoEnquiryStatus,
  exportEnquiriesCSV,
} from '@/server/dal/admin/enquiries';

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
    const actor = getActor(req);
    const searchParams = req.nextUrl.searchParams;

    if (searchParams.get('export')) {
      const type = (searchParams.get('export') || 'demos') as 'demos' | 'hackathons';
      const csv = exportEnquiriesCSV(actor, type);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="azentio-${type}-${Date.now()}.csv"`,
        },
      });
    }

    const demos = getAdminDemoEnquiries(actor);
    const hackathons = getAdminHackathonRegistrations(actor);

    return NextResponse.json({ demos, hackathons });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = getActor(req, body);

    if (body.action === 'update_status') {
      const result = updateDemoEnquiryStatus(actor, body.id, body.status, body.notes);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

