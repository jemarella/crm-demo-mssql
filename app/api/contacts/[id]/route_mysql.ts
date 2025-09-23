import { updateContact } from '@/app/lib/services/contactService';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // The key fix - wrap params in Promise.resolve
    const { id } = await Promise.resolve(params);
    
    const contactData = await request.json();
    const updatedContact = await updateContact(id, contactData);
    return NextResponse.json(updatedContact);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}