import { Metadata } from 'next';
import ContactsTable from '@/app/ui/contacts/table';
import { getContacts, getCallCount, getChatCount } from '@/app/lib/services/contactService';
import { ContactsTableSkeleton } from '@/app/ui/contacts/skeletons';
import { Suspense } from 'react';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import { CreateContact } from '@/app/ui/contacts/buttons';

export const metadata: Metadata = {
  title: 'Contacts',
};

// Define the extended contact type
interface ContactWithStats {
  contactid: string;
  firstname: string;
  lastname: string;
  companyname: string | null;
  email: string | null;
  phonemobile: string | null;
  phonebusiness: string | null;
  photourl: string | null;
  callCount: number;
  chatCount: number;
}

export default async function Page({
  searchParams,
}: {
  searchParams?: { query?: string; page?: string; };
}) {
  const resolvedParams = await Promise.resolve(searchParams || {});
  
  try {
    const query = typeof resolvedParams.query === 'string' 
      ? resolvedParams.query.trim() 
      : '';

    const page = typeof resolvedParams.page === 'string'
      ? resolvedParams.page
      : '1';

    // Fetch contacts first
    const { contacts } = await getContacts(page, 10, query);

    // Then fetch stats for all contacts efficiently
    const contactsWithStats: ContactWithStats[] = await Promise.all(
      contacts.map(async (contact) => {
        const callCount = contact.phonebusiness 
          ? await getCallCount(contact.phonebusiness).catch(() => 0) 
          : 0;
        const chatCount = contact.email 
          ? await getChatCount(contact.email).catch(() => 0) 
          : 0;
        
        return {
          contactid: contact.contactid,
          firstname: contact.firstname,
          lastname: contact.lastname,
          companyname: contact.companyname,
          email: contact.email,
          phonemobile: contact.phonemobile,
          phonebusiness: contact.phonebusiness,
          photourl: contact.photourl,
          callCount,
          chatCount
        };
      })
    );

    // Empty state handling
    if (!contactsWithStats || contactsWithStats.length === 0) {
      return (
        <main className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-center p-6 rounded-lg bg-gray-50 max-w-md">
            <p className="text-gray-600 mb-2">No contacts found</p>
            {query && (
              <p className="text-sm text-gray-500">
                No results for <span className="font-medium">"{query}"</span>. Try a different search.
              </p>
            )}
          </div>
        </main>
      );
    }

    return (
      <div className="w-full">
        <div className="flex w-full items-center justify-between">
          <h1 className={`${lusitana.className} md:text-2xl`}>Contacts</h1>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <Search placeholder="Search contacts..." />
          <CreateContact />
        </div>
        <Suspense fallback={<ContactsTableSkeleton />}>
          {/* Pass the contacts with pre-fetched stats */}
          <ContactsTable contactsWithStats={contactsWithStats} />
        </Suspense>
        
        <div className="mt-8">
          <h2 className={`${lusitana.className} text-xl mb-4`}>Embedded App</h2>
          <iframe 
            src="https://localhost:9025/" 
            width="100%" 
            height="600px"
            className="border rounded-lg"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    );

  } catch (error) {
    console.error('Contacts page error:', error);
    return (
      <main className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-center p-6 rounded-lg bg-red-50 max-w-md">
          <p className="text-red-600 font-medium">Failed to load contacts</p>
          <p className="text-sm text-red-500 mt-2">
            Please try again later or contact support if the problem persists.
          </p>
        </div>
      </main>
    );
  }
}