import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/server/policy/authorize';
import { SEED_PERSONAS } from '@/server/dal/seed';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const personaKey = req.nextUrl.searchParams.get('personaKey') || 'public';
  const actor = SEED_PERSONAS[personaKey] || SEED_PERSONAS.public;

  // Media authorization check: direct URLs must pass authorize()
  const decision = authorize(actor, 'read', {
    kind: 'media',
    id: resolvedParams.id,
    audience: resolvedParams.id.includes('internal') ? 'employee' : 'public',
  });

  if (!decision.allow) {
    return NextResponse.json(
      { error: `Unauthorized media request: ${decision.reason}` },
      { status: 403 }
    );
  }

  return NextResponse.json({
    id: resolvedParams.id,
    status: 'Authorized',
    mimeType: 'video/mp4',
    url: `https://synthetic-cdn.azentio.ai/streams/${resolvedParams.id}.mp4`,
    notice: 'Synthetic media served via authorized proxy route',
  });
}
