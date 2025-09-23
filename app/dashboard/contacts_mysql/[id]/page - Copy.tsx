import { Metadata } from 'next';
import { getContactById, getCallCount, getChatCount } from '@/app/lib/services/contactService';
import ContactForm from '@/app/ui/contacts/form';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Edit Contact',
};

export default async function EditContactPage({
  params,
}: {
  params: { id: string };
}) {

  const resolvedParams = await Promise.resolve(params || {});
  const { id } = resolvedParams;
  const contact = await getContactById(id);
  
  if (!contact) {
    notFound();
  }

  // Fetch interaction counts in parallel
  const [callCount, chatCount] = await Promise.all([
    contact.phonebusiness ? getCallCount(contact.phonebusiness).catch(() => 0) : 0,
    contact.email ? getChatCount(contact.email).catch(() => 0) : 0
  ]);

  return (
    <main>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Contact</h1>
      </div>
      <ContactForm 
        contact={contact}
        initialCallCount={callCount}
        initialChatCount={chatCount}
      />
    </main>
  );
}