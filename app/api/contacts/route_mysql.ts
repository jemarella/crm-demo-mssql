// app/api/contacts/route.ts
import { getContacts } from '@/app/lib/services/contactService';
import { NextResponse } from 'next/server';
import { createContact, updateContact } from '@/app/lib/services/contactService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
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
    console.log (data)
    const contact = await createContact(data);

    return NextResponse.json(contact);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}



