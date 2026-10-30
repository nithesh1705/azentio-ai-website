import { NextRequest, NextResponse } from 'next/server';
import {
  getOrganisations,
  createOrganisation,
  deleteOrganisation,
} from '@/server/dal/store';
import { Actor } from '@/types';

export async function GET() {
  const orgs = getOrganisations();
  return NextResponse.json({ organisations: orgs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actor, name, domain, tier, entitledOfferings } = body;

    const newOrg = createOrganisation(actor as Actor, {
      name,
      domain,
      tier,
      entitledOfferings,
    });

    return NextResponse.json({ success: true, organisation: newOrg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { actor, orgId } = body;

    deleteOrganisation(actor as Actor, orgId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

