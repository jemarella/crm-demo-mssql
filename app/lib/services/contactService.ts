// app/lib/actions.ts
'use server';

import { z } from 'zod';
import { executeNonQuery } from '../database';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Contact form schema
const ContactFormSchema = z.object({
  contactid: z.string(),
  idx: z.coerce.number(),
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  companyname: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phonemobile: z.string().optional(),
  phonebusiness: z.string().optional(),
  saldo: z.coerce.number().default(0),
  photourl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type State = {
  errors?: {
    firstname?: string[];
    lastname?: string[];
    companyname?: string[];
    email?: string[];
    phonemobile?: string[];
    phonebusiness?: string[];
    saldo?: string[];
    photourl?: string[];
  };
  message?: string | null;
};

export async function createContact(prevState: State, formData: FormData): Promise<State> {
  // Validate form fields
  const validatedFields = ContactFormSchema.safeParse({
    firstname: formData.get('firstname'),
    lastname: formData.get('lastname'),
    companyname: formData.get('companyname'),
    email: formData.get('email'),
    phonemobile: formData.get('phonemobile'),
    phonebusiness: formData.get('phonebusiness'),
    saldo: formData.get('saldo'),
    photourl: formData.get('photourl'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Contact.',
    };
  }

  // Prepare data for insertion
  const { firstname, lastname, companyname, email, phonemobile, phonebusiness, saldo, photourl } = validatedFields.data;
  const contactid = `CT_${Date.now()}`; // Generate a unique contact ID

  try {
    // Insert the contact into the database
    await executeNonQuery(
      `INSERT INTO contacts (
        contactid, firstname, lastname, companyname, email, 
        phonemobile, phonebusiness, saldo, photourl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [contactid, firstname, lastname, companyname || '', email, 
       phonemobile || '', phonebusiness || '', saldo, photourl || '']
    );
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Create Contact.',
    };
  }

  // Revalidate the cache for the contacts page and redirect the user.
  revalidatePath('/dashboard/contacts');
  redirect('/dashboard/contacts');
}

export async function updateContact(prevState: State, formData: FormData): Promise<State> {
  // Validate form fields
  const validatedFields = ContactFormSchema.safeParse({
    contactid: formData.get('contactid'),
    idx: formData.get('idx'),
    firstname: formData.get('firstname'),
    lastname: formData.get('lastname'),
    companyname: formData.get('companyname'),
    email: formData.get('email'),
    phonemobile: formData.get('phonemobile'),
    phonebusiness: formData.get('phonebusiness'),
    saldo: formData.get('saldo'),
    photourl: formData.get('photourl'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Contact.',
    };
  }

  // Prepare data for update
  const { contactid, idx, firstname, lastname, companyname, email, phonemobile, phonebusiness, saldo, photourl } = validatedFields.data;

  try {
    // Update the contact in the database
    await executeNonQuery(
      `UPDATE contacts SET 
        firstname = ?, lastname = ?, companyname = ?, email = ?,
        phonemobile = ?, phonebusiness = ?, saldo = ?, photourl = ?
      WHERE contactid = ? AND idx = ?`,
      [firstname, lastname, companyname || '', email, 
       phonemobile || '', phonebusiness || '', saldo, photourl || '',
       contactid, idx]
    );
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Update Contact.',
    };
  }

  // Revalidate the cache for the contacts page and redirect the user.
  revalidatePath('/dashboard/contacts');
  redirect('/dashboard/contacts');
}

