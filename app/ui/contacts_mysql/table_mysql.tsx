import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import { Contact, getCallCount, getChatCount } from '@/app/lib/services/contactService';
import Link from 'next/link';
import { InteractiveElements } from '@/app/ui/contacts/interactive-elements';

export default async function ContactsTable({
  contacts,
}: {
  contacts: Contact[];
}) {

    // Fetch counts for all contacts upfront to avoid N+1 queries
  const contactsWithStats = await Promise.all(
    contacts.map(async (contact) => {
      try {
        const [callCount, chatCount] = await Promise.all([
          contact.phonebusiness ? getCallCount(contact.phonebusiness).catch(() => 0) : 0,
          contact.email ? getChatCount(contact.email).catch(() => 0) : 0
        ]);
        
        return {
          ...contact,
          callCount,
          chatCount
        };
      } catch (error) {
        console.error(`Error fetching stats for contact ${contact.contactid}:`, error);
        return {
          ...contact,
          callCount: 0,
          chatCount: 0
        };
      }
    })
  );

  return (
    <div className="w-full">

      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <div className="md:hidden">
                {contactsWithStats?.map((contact) => (
                  <div
                    key={contact.contactid}
                    className="mb-2 w-full rounded-md bg-white p-4"
                  >
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="mb-2 flex items-center">
                          <div className="flex items-center gap-3">
                            {contact.photourl && (
                              <Image
                                src={contact.photourl}
                                className="rounded-full"
                                alt={`${contact.firstname} ${contact.lastname}'s profile picture`}
                                width={28}
                                height={28}
                              />
                            )}
                            <p>{contact.firstname} {contact.lastname}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {contact.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between border-b py-5">
      
                      <div className="flex w-full items-center justify-between pt-4">
                        <div className="flex w-1/2 flex-col">
                          <p className="text-xs">Calls</p>
          <InteractiveElements
            phoneNumber={contact.phonebusiness || 'N/A'}
            email={contact.email || 'N/A'}
            contactName={`${contact.firstname} ${contact.lastname}`}
            callCount={contact.callCount}
            chatCount={contact.chatCount}
          />
                        </div>
                        <div className="flex w-1/2 flex-col">
                          <p className="text-xs">Chats</p>
                          <Link 
                            href={`/dashboard/contacts/${contact.contactid}?tab=chats`}
                            className="text-blue-600 hover:underline"
                          >
                            {contact.chatCount}
                          </Link>
                        </div>
                      </div>

                      <div className="flex w-1/2 flex-col">
                        <p className="text-xs">Company</p>
                        <p className="font-medium">{contact.companyname || 'N/A'}</p>
                      </div>
                      <div className="flex w-1/2 flex-col">
                        <p className="text-xs">Mobile</p>
                        <p className="font-medium">{contact.phonemobile || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="pt-4 text-sm">
                      <p>ID: {contact.contactid}</p>
                    </div>
                  </div>
                ))}
              </div>


      {/* Desktop View */}
      <div className="mt-6 hidden md:block">
        <div className="overflow-x-auto rounded-lg border shadow">
          <table className="min-w-full divide-y divide-gray-200"></table>              
              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interactions
                    </th>
                  </tr>
                </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {contactsWithStats.map((contact) => (
                <tr key={contact.contactid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {contact.photourl && (
                        <Image
                          src={contact.photourl}
                          width={40}
                          height={40}
                          alt={`${contact.firstname} ${contact.lastname}`}
                          className="rounded-full mr-3"
                        />
                      )}
                      <div>
                        <Link 
                          href={`/dashboard/contacts/${contact.contactid}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {contact.firstname} {contact.lastname}
                        </Link>
                        <p className="text-sm text-gray-500">ID: {contact.contactid}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <p>{contact.email || 'No email'}</p>
                      <p>{contact.phonemobile || 'No mobile'}</p>
                      <p>{contact.phonebusiness || 'No business phone'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contact.companyname || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-6">
        <InteractiveElements
          phoneNumber={contact.phonebusiness || 'N/A'}
          email={contact.email || 'N/A'}
          contactName={`${contact.firstname} ${contact.lastname}`}
          callCount={contact.callCount}
          chatCount={contact.chatCount}
        />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}