import { NextRequest, NextResponse } from 'next/server';
import { submitContactEnquiry } from '@/server/dal/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, workEmail, companyName, country, interestDomain, message, phone } = body;

    if (!fullName || !workEmail || !companyName || !message) {
      return NextResponse.json(
        { error: 'Please provide full name, work email, company name, and message.' },
        { status: 400 }
      );
    }

    const saved = await submitContactEnquiry({
      fullName,
      workEmail,
      companyName,
      country: country || 'Global',
      interestDomain: interestDomain || 'General',
      message,
      phone: phone || undefined,
    });

    return NextResponse.json({
      success: true,
      enquiry: saved,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to submit contact enquiry.' },
      { status: 500 }
    );
  }
}

