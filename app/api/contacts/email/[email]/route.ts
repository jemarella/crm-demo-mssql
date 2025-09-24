import { NextRequest, NextResponse } from 'next/server';
import { fetchContactByEmail } from '@/app/lib/contacts-data';

interface Params {
  email: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> } // params is a Promise
) {
  try {
    const resolvedParams = await params; // Await the params first
    const contact = await fetchContactByEmail(resolvedParams.email);
    
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    
    // Return both contact data and edit URL
    return NextResponse.json({
      contact,
      editUrl: `/dashboard/contacts/${contact.contactid}/edit`,
      viewUrl: `/dashboard/contacts/${contact.contactid}`
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST method to directly redirect to edit page
export async function POST(
  request: Request,
  { params }: { params: Promise<Params> } // params is a Promise
) {
  try {
    const resolvedParams = await params; // Await the params first
    const contact = await fetchContactByEmail(resolvedParams.email);

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Contact found',
      contactId: contact.contactid,
      redirect: `/dashboard/contacts/${contact.contactid}/edit`,
    });
  } catch (error) {
    console.error('Lookup error:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching for the contact.' },
      { status: 500 }
    );
  }
}