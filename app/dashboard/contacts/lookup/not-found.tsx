import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Contact Not Found</h1>
        <p className="text-gray-600 mb-4">
          The contact you're looking for doesn't exist.
        </p>
        <Link 
          href="/dashboard/contacts" 
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Contacts
        </Link>
      </div>
    </div>
  );
}