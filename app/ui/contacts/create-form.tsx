'use client';

import Link from 'next/link';
import {
  UserCircleIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createContact, State } from '@/app/lib/services/contactService';
import { useActionState } from 'react';

export default function Form() {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createContact, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Contact Name */}
        <div className="mb-4">
          <label htmlFor="firstname" className="mb-2 block text-sm font-medium">
            First Name
          </label>
          <div className="relative">
            <input
              id="firstname"
              name="firstname"
              type="text"
              placeholder="Enter first name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="firstname-error"
            />
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="firstname-error" aria-live="polite" aria-atomic="true">
            {state.errors?.firstname &&
              state.errors.firstname.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Last Name */}
        <div className="mb-4">
          <label htmlFor="lastname" className="mb-2 block text-sm font-medium">
            Last Name
          </label>
          <div className="relative">
            <input
              id="lastname"
              name="lastname"
              type="text"
              placeholder="Enter last name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="lastname-error"
            />
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="lastname-error" aria-live="polite" aria-atomic="true">
            {state.errors?.lastname &&
              state.errors.lastname.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Company Name */}
        <div className="mb-4">
          <label htmlFor="companyname" className="mb-2 block text-sm font-medium">
            Company Name
          </label>
          <div className="relative">
            <input
              id="companyname"
              name="companyname"
              type="text"
              placeholder="Enter company name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="companyname-error"
            />
            <BuildingOfficeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="companyname-error" aria-live="polite" aria-atomic="true">
            {state.errors?.companyname &&
              state.errors.companyname.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="email-error"
            />
            <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {state.errors?.email &&
              state.errors.email.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Mobile Phone */}
        <div className="mb-4">
          <label htmlFor="phonemobile" className="mb-2 block text-sm font-medium">
            Mobile Phone
          </label>
          <div className="relative">
            <input
              id="phonemobile"
              name="phonemobile"
              type="tel"
              placeholder="Enter mobile phone"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="phonemobile-error"
            />
            <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="phonemobile-error" aria-live="polite" aria-atomic="true">
            {state.errors?.phonemobile &&
              state.errors.phonemobile.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Business Phone */}
        <div className="mb-4">
          <label htmlFor="phonebusiness" className="mb-2 block text-sm font-medium">
            Business Phone
          </label>
          <div className="relative">
            <input
              id="phonebusiness"
              name="phonebusiness"
              type="tel"
              placeholder="Enter business phone"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="phonebusiness-error"
            />
            <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="phonebusiness-error" aria-live="polite" aria-atomic="true">
            {state.errors?.phonebusiness &&
              state.errors.phonebusiness.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Balance */}
        <div className="mb-4">
          <label htmlFor="saldo" className="mb-2 block text-sm font-medium">
            Balance
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="saldo"
                name="saldo"
                type="number"
                step="0.01"
                placeholder="Enter balance amount"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="saldo-error"
                defaultValue="0.00"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div id="saldo-error" aria-live="polite" aria-atomic="true">
            {state.errors?.saldo &&
              state.errors.saldo.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Photo URL */}
        <div className="mb-4">
          <label htmlFor="photourl" className="mb-2 block text-sm font-medium">
            Photo URL (Optional)
          </label>
          <div className="relative">
            <input
              id="photourl"
              name="photourl"
              type="url"
              placeholder="Enter photo URL"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="photourl-error"
            />
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="photourl-error" aria-live="polite" aria-atomic="true">
            {state.errors?.photourl &&
              state.errors.photourl.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* General Error Message */}
        <div aria-live="polite" aria-atomic="true">
          {state.message ? (
            <p className="mt-2 text-sm text-red-500">{state.message}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/contacts"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Contact</Button>
      </div>
    </form>
  );
}