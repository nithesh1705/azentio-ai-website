import { NextRequest, NextResponse } from 'next/server';
import { verifyStepup, requestStepup } from '@/server/services/stepup';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, userId = 'usr-admin-max', purpose = 'Elevated Action' } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: 'Verification code is required.' }, { status: 400 });
    }

    // In demo environment, provision an active stepup challenge if none exists yet
    requestStepup(userId, purpose);

    const result = verifyStepup(userId, code, purpose);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Elevated authorization granted for 10 minutes.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Verification failure' }, { status: 500 });
  }
}

