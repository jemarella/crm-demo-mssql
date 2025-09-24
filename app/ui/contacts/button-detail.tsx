// ui/contacts/button-detail.tsx
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function ReturnContact() {
  return (
    <Link
      href="/dashboard/contacts"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <ArrowLeftIcon className="h-5 mr-2" />
      <span className="hidden md:block">Back to Contacts</span>
    </Link>
  );
}