import { NextRequest, NextResponse } from 'next/server';
import { Actor } from '@/types';
import {
  getAdminAuditEvents,
  getAdminAuditEventById,
  verifyAdminAuditChain,
  exportAuditTrail,
} from '@/server/dal/admin/audit';

function getActor(req: NextRequest): Actor {
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

    // Chain verification endpoint
    if (searchParams.get('verify') === 'true') {
      const verification = verifyAdminAuditChain(actor);
      return NextResponse.json(verification);
    }

    // Export endpoint
    const exportFormat = searchParams.get('export');
    if (exportFormat === 'csv' || exportFormat === 'json') {
      const filter = {
        action: searchParams.get('action') || undefined,
        resourceKind: searchParams.get('resourceKind') || undefined,
        outcome: searchParams.get('outcome') || undefined,
        search: searchParams.get('search') || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
      };

      const fileContent = exportAuditTrail(actor, exportFormat as any, filter);

      if (exportFormat === 'csv') {
        return new NextResponse(fileContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="azentio-audit-ledger-${Date.now()}.csv"`,
          },
        });
      }

      return new NextResponse(fileContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="azentio-audit-ledger-${Date.now()}.json"`,
        },
      });
    }

    // Single item detail
    const id = searchParams.get('id');
    if (id) {
      const event = getAdminAuditEventById(actor, id);
      return NextResponse.json({ event });
    }

    // Filtered list
    const filter = {
      action: searchParams.get('action') || undefined,
      resourceKind: searchParams.get('resourceKind') || undefined,
      outcome: searchParams.get('outcome') || undefined,
      search: searchParams.get('search') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    const events = getAdminAuditEvents(actor, filter);
    return NextResponse.json({ events, totalCount: events.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
