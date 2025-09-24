'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactLookup() {
  const [searchType, setSearchType] = useState<'phone' | 'email'>('phone');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/contacts/${searchType}/${encodeURIComponent(searchValue)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to the edit page
        router.push(data.redirect);
      } else {
        setError(data.error || 'Contact not found');
      }
    } catch (err) {
      setError('Failed to search for contact');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectAccess = (contactId: string) => {
    router.push(`/dashboard/contacts/${contactId}/edit`);
  };

  const handlePrefillPhone = () => {
    setSearchType('phone');
    setSearchValue('+1234567890');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Quick Contact Lookup</h2>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-4">
          <select 
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'phone' | 'email')}
            className="flex-1 border rounded-md px-3 py-2"
          >
            <option value="phone">Phone Number</option>
            <option value="email">Email</option>
          </select>
          
          <input
            type={searchType === 'phone' ? 'tel' : 'email'}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchType === 'phone' ? 'Enter phone number' : 'Enter email address'}
            className="flex-1 border rounded-md px-3 py-2"
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Searching...' : 'Edit Contact'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Quick access examples */}
      {/*  Quitar ejemplos por ahora
      <div className="mt-6">
        <h3 className="font-medium mb-2">Quick Access Examples:</h3>
        <div className="space-y-2">
          <button
            onClick={() => handleDirectAccess('CC27C14A-0ACF-4F4A-A6C9-D45682C144B9')}
            className="block text-blue-600 hover:text-blue-800 hover:underline"
          >
            Edit Amy Burns (Sample)
          </button>
          <button
            onClick={handlePrefillPhone}
            className="block text-blue-600 hover:text-blue-800 hover:underline"
          >
            Pre-fill phone search
          </button>
        </div>
      </div>
      */}
    </div>
  );
}