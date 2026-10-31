import { NextRequest, NextResponse } from 'next/server';
import { getMediaItems, uploadMediaItem, deleteMediaItem } from '@/server/dal/admin/content';
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
    const audience = searchParams.get('audience') as any;
    const search = searchParams.get('search') || undefined;

    const actor = getActor(req);
    const items = getMediaItems(actor, { audience, search });

    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = getActor(req, body);

    const uploaded = uploadMediaItem(actor, {
      filename: body.filename,
      mimeType: body.mimeType || 'image/png',
      sizeBytes: body.sizeBytes || 102400,
      altText: body.altText || body.filename,
      audience: body.audience || 'public',
      url: body.url,
    });

    return NextResponse.json({ success: true, item: uploaded });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Media id required' }, { status: 400 });
    }

    const actor = getActor(req);
    const result = deleteMediaItem(actor, id);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

