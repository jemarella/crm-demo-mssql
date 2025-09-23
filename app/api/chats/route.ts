// app/api/chats/route.ts
import { getChatsByEmail } from '@/app/lib/services/contactService';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json(
      { error: 'Email address required' }, 
      { status: 400 }
    );
  }

  try {
    const chats = await getChatsByEmail(email);
    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}