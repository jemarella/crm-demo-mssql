import Form from '@/app/ui/contacts/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Contact',
};

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Contacts', href: '/dashboard/contacts' },
          {
            label: 'Create Contact',
            href: '/dashboard/contacts/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}