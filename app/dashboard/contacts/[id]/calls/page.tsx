import CallsTable from '@/app/ui/calls/table';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { getCallsByContactNumber, fetchContactById } from '@/app/lib/contacts-data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ReturnContact } from '@/app/ui/contacts/button-detail';

export const metadata: Metadata = {
  title: 'Contact Calls',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  
  // Fetch both contact details and calls
  const [contact, calls] = await Promise.all([
    fetchContactById(id),
    getCallsByContactNumber(id)
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
            label: 'Calls',
            href: `/dashboard/contacts/${id}/calls`,
            active: true,
          },
        ]}
      />

      {/* Add the header section with title and button */}
      <div className="flex w-full items-center justify-between mt-4">
        <h1 className={`text-2xl`}>
          Calls for {contact.firstname} {contact.lastname}
        </h1>
        <ReturnContact />
      </div>

      <CallsTable 
        calls={calls} 
        contactName={`${contact.firstname} ${contact.lastname}`}
        phoneNumber={id}
      />
    </main>
  );
}