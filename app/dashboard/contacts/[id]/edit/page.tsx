import Form from '@/app/ui/contacts/edit-form';
import ContactLookup from '@/app/ui/contacts/contact-lookup'; // Add this
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchContactById } from '@/app/lib/contacts-data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Contact',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const contact = await fetchContactById(id);

  if (!contact) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Contacts', href: '/dashboard/contacts' },
          {
            label: 'Edit Contact',
            href: `/dashboard/contacts/${id}/edit`,
            active: true,
          },
        ]}
      />
      {/* Quick lookup component */}
      {<ContactLookup />}
      
      {/* Edit form */}
      {/* <div className="bg-white rounded-lg shadow-md">  Queda mejor sin el div*/}
        <Form contact={contact} />
      {/* </div>*/}
    </main>
  );
}