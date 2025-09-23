import { Metadata } from 'next';
import ContactForm from '@/app/ui/contacts/form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';


export const metadata: Metadata = {
  title: 'Create Contact',
};

//export default function CreateContactPage() {
//  return (
//    <main>
//      <div className="mb-8 flex items-center justify-between">
//        <h1 className="text-2xl font-bold">Create New Contact</h1>
//      </div>
//      <ContactForm />
//    </main>
//  );
//}


export default async function CreateContactPage() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/contacts' },
          {
            label: 'Create Contact',
            href: '/dashboard/contacts/create',
            active: true,
          },
        ]}
      />
      <ContactForm />
    </main>
  );
}
