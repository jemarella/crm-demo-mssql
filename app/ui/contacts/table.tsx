import { UpdateContact, DeleteContact } from '@/app/ui/contacts/buttons';
import { formatCurrency } from '@/app/lib/utils';
import { fetchFilteredContacts, ContactWithStats } from '@/app/lib/contacts-data';
import Link from 'next/link';

export default async function ContactsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const contacts: ContactWithStats[] = await fetchFilteredContacts(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {contacts?.map((contact) => (
              <div
                key={contact.contactid}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      {contact.photourl && (
                        <img
                          src={contact.photourl}
                          className="mr-2 rounded-full"
                          width={28}
                          height={28}
                          alt={`${contact.firstname} ${contact.lastname}'s profile picture`}
                        />
                      )}
                      <p>{`${contact.firstname} ${contact.lastname}`}</p>
                    </div>
                    <p className="text-sm text-gray-500">{contact.email}</p>
                    <p className="text-sm text-gray-500">{contact.companyname}</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-sm font-medium">
                      Mobile: {contact.phonemobile}
                    </p>
                    <p className="text-sm">
                      Balance: {formatCurrency(contact.saldo)}
                    </p>
                    <div className="mt-2 flex gap-4">
                      <Link 
                        href={`/dashboard/contacts/${contact.contactid}/calls`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Calls: {contact.callCount}
                      </Link>
                      <Link 
                        href={`/dashboard/contacts/${contact.contactid}/chats`}
                        className="text-sm text-green-600 hover:text-green-800 hover:underline"
                      >
                        Chats: {contact.chatCount}
                      </Link>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateContact id={contact.contactid} />
                    <DeleteContact id={contact.contactid} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Contact
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Company
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Mobile
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Business Phone
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Balance
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Calls
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Chats
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {contacts?.map((contact) => (
                <tr
                  key={contact.contactid}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {contact.photourl && (
                        <img
                          src={contact.photourl}
                          className="rounded-full"
                          width={28}
                          height={28}
                          alt={`${contact.firstname} ${contact.lastname}'s profile picture`}
                        />
                      )}
                      <p>{`${contact.firstname} ${contact.lastname}`}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {contact.companyname}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {contact.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {contact.phonemobile}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {contact.phonebusiness}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(contact.saldo)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center">
                    <Link 
                      href={`/dashboard/contacts/${contact.contactid}/calls`}
                      className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium hover:underline ${
                        contact.callCount > 0 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {contact.callCount}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center">
                    <Link 
                      href={`/dashboard/contacts/${contact.contactid}/chats`}
                      className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium hover:underline ${
                        contact.chatCount > 0 
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {contact.chatCount}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateContact id={contact.contactid} />
                      <DeleteContact id={contact.contactid} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}