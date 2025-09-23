// Create a temporary test route at app/api/test/route.ts
import { verifyUserCredentials } from '@/app/lib/services/userService';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function GET() {
  const email = 'jesus.arellanes@programadoresjava.mx';
  const password = 'testpassword';
  
  try {
    const user = await verifyUserCredentials(email, password);
    return NextResponse.json({ 
      userExists: user !== null,
      credentialsMatch: !!user,
      hashTest: await bcrypt.compare(password, '$2b$10$hfopIwo/7eTO10dF9cB6i.DjULQRSJb.DMun77rXz/xO4N6JYbt36')


    });
  } catch (error) {
    return NextResponse.json({ error: 'error' }, { status: 500 });
  }
}