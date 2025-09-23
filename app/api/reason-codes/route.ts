// app/api/reason-codes/route.ts
import { getReasons } from '@/app/lib/services/getReasons';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const reasons = await getReasons();
    return NextResponse.json(reasons);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reason codes' },
      { status: 500 }
    );
  }
}