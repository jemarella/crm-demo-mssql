// app/api/contacts/route.ts
import { getContacts, createContact } from '@/app/lib/services/contactService';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1'; // Keep as string for service
  const search = searchParams.get('search') || undefined;

  try {
    const { contacts, totalCount } = await getContacts(page, 10, search);
    return NextResponse.json({ contacts, totalCount });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Creating contact with data:', data);
    
    const contact = await createContact(data);
    
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    
    // Provide more specific error messages
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to create contact';
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}