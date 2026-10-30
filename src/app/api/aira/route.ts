import { NextRequest, NextResponse } from 'next/server';
import { queryAIRA } from '@/server/dal/store';
import { SEED_PERSONAS } from '@/server/dal/seed';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, personaKey } = body;

    // Use current persona or fallback to public visitor
    const actor = SEED_PERSONAS[personaKey] || SEED_PERSONAS.public;

    const result = queryAIRA(actor, prompt || '');

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
