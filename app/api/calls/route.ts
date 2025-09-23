// app/api/calls/route.ts
import { getCallsByNumber } from '@/app/lib/services/contactService';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phoneNumber = searchParams.get('phoneNumber');
  
  if (!phoneNumber) {
    return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
  }

  try {
    const calls = await getCallsByNumber(phoneNumber);
    return NextResponse.json(calls);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 });
  }
}