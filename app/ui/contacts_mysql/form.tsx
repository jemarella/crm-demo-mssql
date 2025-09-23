'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { useRouter } from 'next/navigation';
import { Contact } from '@/app/lib/services/contactService';
import { InteractiveElements } from '@/app/ui/contacts/interactive-elements';


export default function ContactForm({ 
  contact,
  initialCallCount = 0,
  initialChatCount = 0
}: { 
  contact?: Contact;
  initialCallCount?: number;
  initialChatCount?: number;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      const url = contact?.contactid 
        ? `/api/contacts/${contact.contactid}`
        : '/api/contacts';
      const method = contact?.contactid ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save contact');
      }

      router.push('/dashboard/contacts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-md bg-gray-50 p-4 md:p-6">
      <form onSubmit={handleSubmit}>
        {contact?.contactid && (
          <input type="hidden" name="contactid" value={contact.contactid} />
        )}

        {/* Basic Information */}
        <div className="mb-4">
          <h2 className="text-lg font-medium">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
            <div>
              <label htmlFor="firstname" className="block text-sm font-medium">
                First Name
              </label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                defaultValue={contact?.firstname}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="lastname" className="block text-sm font-medium">
                Last Name
              </label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                defaultValue={contact?.lastname}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="companyname" className="block text-sm font-medium">
                Company
              </label>
              <input
                type="text"
                id="companyname"
                name="companyname"
                defaultValue={contact?.companyname || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={contact?.email || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="mb-4">
          <h2 className="text-lg font-medium">Phone Numbers</h2>
          <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
            {['phonemobile', 'phonemobile2', 'phonehome', 'phonehome2', 'phonebusiness', 'phonebusiness2', 'phoneother'].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium capitalize">
                  {field.replace('phone', '').replace('2', ' 2')}
                </label>
                <input
                  type="tel"
                  id={field}
                  name={field}
                  defaultValue={contact?.[field as keyof Contact] || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Interaction Counters - Only for existing contacts */}
        {contact?.contactid && (
          <div className="mb-4">
            <h2 className="text-lg font-medium">Interactions</h2>
            <InteractiveElements 
              phoneNumber={contact.phonebusiness || 'N/A'}
              email={contact.email || 'N/A'}
              contactName={`${contact.firstname} ${contact.lastname}`}
              callCount={initialCallCount}
              chatCount={initialChatCount}
              variant="form"
            />
          </div>
        )}
        {/* Other Information */}
        <div className="mb-4">
          <h2 className="text-lg font-medium">Other Information</h2>
          <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
            {['faxbusiness', 'faxhome', 'pager', 'photourl', 'pwd_ivr', 'saldo'].map((field) => (
              <div key={field}>
                <label htmlFor={field} className={`block text-sm font-medium ${field !== 'pwd_ivr' ? 'capitalize' : ''}`}>
                  {field === 'pwd_ivr' ? 'ID para IVR' : field}
                </label>
                <input
                  type={field === 'photourl' ? 'url' : 'text'}
                  id={field}
                  name={field}
                  defaultValue={contact?.[field as keyof Contact] || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/dashboard/contacts"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : contact ? 'Update Contact' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </div>  
  );
}