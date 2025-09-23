import { Metadata } from 'next';
import { Contact, getContactByPhoneOrEmail, getCallCount, getChatCount } from '@/app/lib/services/contactService';
import ContactForm from '@/app/ui/contacts/form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Find Contact',
};

export default async function FindContactPage({
  searchParams,
}: {
  searchParams?: { phonebusiness?: string; email?: string; contactid?: string };
}) {
  const resolvedParams = await Promise.resolve(searchParams || {});
  const { phonebusiness, email, contactid } = resolvedParams;

  let contact: Contact | null = null;
  let errorMessage: string | null = null;
  let callCount = 0;
  let chatCount = 0;

  if (!phonebusiness && !email && !contactid) {
    errorMessage = 'Please provide either a phone number, email, or contact ID to search.';
  } else {
    try {
      // Get contact first
      contact = await getContactByPhoneOrEmail({ phonebusiness, email, contactid });

      if (contact) {
        // Then get counts in parallel
        [callCount, chatCount] = await Promise.all([
          contact.phonebusiness ? getCallCount(contact.phonebusiness).catch(() => 0) : 0,
          contact.email ? getChatCount(contact.email).catch(() => 0) : 0
        ]);
      } else {
        errorMessage = 'No contact found with the provided criteria.';
      }
    } catch (error) {
      console.error('Search error:', error);
      errorMessage = 'An error occurred during search. Please try again.';
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 sm:mb-0">
            {contact ? 'Contact Details' : 'Find Contact'}
          </h1>
          <Link
            href="/dashboard/contacts"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Contacts
          </Link>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {errorMessage}</span>
          </div>
        )}

        {contact ? (
          <ContactForm 
            contact={contact}
            initialCallCount={callCount}
            initialChatCount={chatCount}
          />
        ) : (
          <div className="text-center py-10 text-gray-600">
            <p>{errorMessage || 'Use search parameters to find a contact'}</p>
            <div className="mt-4 text-sm space-y-2">
              <p>Examples:</p>
              <code className="block bg-gray-200 p-1 rounded">/dashboard/contacts/find?phonebusiness=1234567890</code>
              <code className="block bg-gray-200 p-1 rounded">/dashboard/contacts/find?email=user@example.com</code>
              <code className="block bg-gray-200 p-1 rounded">/dashboard/contacts/find?contactid=contact_123</code>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}