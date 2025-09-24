import ChatsTable from '@/app/ui/chats/table';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { getChatsByEmail, fetchContactById } from '@/app/lib/contacts-data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ReturnContact } from '@/app/ui/contacts/button-detail';
export const metadata: Metadata = {
  title: 'Contact Chats',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  
  // Fetch both contact details and chats
  const [contact, chats] = await Promise.all([
    fetchContactById(id),
    getChatsByEmail(id) // Note: This needs the email, not the ID
  ]);

  if (!contact) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Contacts', href: '/dashboard/contacts' },
          { 
            label: `${contact.firstname} ${contact.lastname}`, 
            href: `/dashboard/contacts/${id}/edit` 
          },
          {
            label: 'Chats',
            href: `/dashboard/contacts/${id}/chats`,
            active: true,
          },
        ]}
      />

      {/* Add the header section with title and button */}
      <div className="flex w-full items-center justify-between mt-4">
        <h1 className={`text-2xl`}>
          Chats for {contact.firstname} {contact.lastname}
        </h1>
        <ReturnContact />
      </div>

      <ChatsTable 
        chats={chats} 
        contactName={`${contact.firstname} ${contact.lastname}`}
        email={contact.email}
      />
    </main>
  );
}