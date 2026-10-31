import { NextRequest, NextResponse } from 'next/server';
import { Actor } from '@/types';
import {
  getSystemConfig,
  updateSystemConfig,
  testRegexSensitivity,
} from '@/server/dal/admin/config_ops';

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

    if (searchParams.get('testRegex') === 'true') {
      const text = searchParams.get('text') || '';
      const results = testRegexSensitivity(actor, text);
      return NextResponse.json({ results });
    }

    const config = getSystemConfig(actor);
    return NextResponse.json({ config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = getActor(req, body);

    if (body.action === 'testRegex') {
      const results = testRegexSensitivity(actor, body.text || '');
      return NextResponse.json({ results });
    }

    const result = updateSystemConfig(actor, body.updates || {});
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
