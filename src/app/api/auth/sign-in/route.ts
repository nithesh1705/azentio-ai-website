import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/server/dal/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, orgId } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const authResult = authenticateUser(email, password, orgId);

    return NextResponse.json({
      success: true,
      actor: authResult.actor,
      redirectPath: authResult.redirectPath,
      user: authResult.user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Authentication failed.' },
      { status: 401 }
    );
  }
}

