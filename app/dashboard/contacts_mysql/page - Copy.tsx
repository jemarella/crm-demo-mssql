import { Metadata } from 'next';
import ContactsTable from '@/app/ui/contacts/table';
import { getContacts } from '@/app/lib/services/contactService';
import { ContactsTableSkeleton } from '@/app/ui/contacts/skeletons';
import { Suspense } from 'react';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';

import { CreateContact} from '@/app/ui/contacts/buttons';

export const metadata: Metadata = {
  title: 'Contacts',
};

export default async function Page({
  searchParams,
}: {
    searchParams?: { query?: string; page?: string; };
}) {
  const resolvedParams = await Promise.resolve(searchParams || {});
  //const { query, page} = resolvedParams;
  
  try {
    // Safely resolve searchParams (handles both Promise and direct object)
    //const resolvedParams = searchParams instanceof Promise 
    //  ? await searchParams 
    //  : searchParams || {};
    
    // Extract and validate query
    const query = typeof resolvedParams.query === 'string' 
      ? resolvedParams.query.trim() 
      : '';

    // Extract and validate page number
    const page = typeof resolvedParams.page === 'string'
      ? resolvedParams.page // pass as string to service
      : '1'; // default as string

    // Fetch data
    const { contacts } = await getContacts(page, 10, query);

    // Empty state handling
    if (!contacts || contacts.length === 0) {
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
        {/* Your existing content */}
        <div className="flex w-full items-center justify-between">
          <h1 className={`${lusitana.className} md:text-2xl`}>
              Contacts
          </h1>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <Search placeholder="Search invoices..." />
          <CreateContact />
        </div>
        <Suspense fallback={<ContactsTableSkeleton />}>
          <ContactsTable contacts={contacts} />
        </Suspense>
        
        {/* Add the iframe below your existing content */}
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
          <p className="text-red-600 font-medium">
            Failed to load contacts
          </p>
          <p className="text-sm text-red-500 mt-2">
            Please try again later or contact support if the problem persists.
          </p>
        </div>
      </main>
    );
  }
}


