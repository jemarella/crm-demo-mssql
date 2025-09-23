import { updateContact, getContactById } from '@/app/lib/services/contactService';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params); //Correct way
    
    const contact = await getContactById(id);
    
    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params); //Correct way
    
    const contactData = await request.json();
    console.log(`Updating contact ${id} with data:`, contactData);
    
    const updatedContact = await updateContact(id, contactData);
    
    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error('Error updating contact:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to update contact';
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params); //Correct way
    
    // You'll need to implement deleteContact in your service
    // const result = await deleteContact(id);
    
    return NextResponse.json(
      { message: 'Contact deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}