import { redirect, notFound } from 'next/navigation';
import { fetchContactByPhone, fetchContactByEmail } from '@/app/lib/contacts-data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Lookup',
};

interface SearchParams {
  phone?: string;
  email?: string;
}

export default async function Page(props: {
  searchParams?: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const phone = searchParams?.phone;
  const email = searchParams?.email;

  // Validate parameters
  if (!phone && !email) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Contact Lookup</h1>
          <p className="text-gray-600">Please provide a phone number or email address</p>
          <div className="mt-4 space-y-2">
            <p>Usage examples:</p>
            <code className="block bg-gray-100 p-2 rounded">
              /dashboard/contacts/lookup?phone=+1234567890
            </code>
            <code className="block bg-gray-100 p-2 rounded">
              /dashboard/contacts/lookup?email=user@example.com
            </code>
          </div>
        </div>
      </div>
    );
  }

  if (phone && email) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>Please provide only one parameter (phone OR email), not both.</p>
        </div>
      </div>
    );
  }


   let contact;

    try {
        if (phone) {
        contact = await fetchContactByPhone(phone);
        } else if (email) {
        contact = await fetchContactByEmail(email);
        }
    } catch (error) {
        console.error('Lookup error:', error);
        // You can handle the data fetching error gracefully here, e.g., show an error UI.
        return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center text-red-600">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p>An error occurred while searching for the contact.</p>
            <a
                href="/dashboard/contacts"
                className="mt-4 inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
                Back to Contacts
            </a>
            </div>
        </div>
        );
    }

  // Perform redirect or notFound() after the try...catch block
  if (contact) {
    redirect(`/dashboard/contacts/${contact.contactid}/edit`);
  } else {
    notFound();
  }

}