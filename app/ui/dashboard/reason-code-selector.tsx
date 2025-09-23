'use client';

import { useState, useEffect } from 'react';
import { 
  Combobox, 
  ComboboxInput, 
  ComboboxButton, 
  ComboboxOptions, 
  ComboboxOption 
} from '@headlessui/react';
import { useReasonCode } from '@/app/lib/hooks/use-reason-code';

type ReasonCode = {
  reason_code: number;
  reason_description: string;
};

export default function ReasonCodeSelector() {
  const { selectedCode, setSelectedCode } = useReasonCode();
  const [query, setQuery] = useState('');
  const [reasonCodes, setReasonCodes] = useState<ReasonCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReasonCodes() {
      try {
        const response = await fetch('/api/reason-codes');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Expected array but got ' + typeof data);
        }
        
        setReasonCodes(data);
      } catch (error) {
        console.error('Error fetching reason codes:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReasonCodes();
  }, []);

  const filteredCodes = query === ''
    ? reasonCodes
    : reasonCodes.filter(code => 
        code.reason_description.toLowerCase().includes(query.toLowerCase()) || 
        code.reason_code.toString().includes(query)
      );

  if (isLoading) {
    return (
      <div className="w-64 rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm">
        Loading reason codes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-64 rounded-md border border-red-300 bg-red-50 py-2 pl-3 pr-10 text-sm text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-64">
      <Combobox value={selectedCode} onChange={setSelectedCode}>
        <div className="relative">
          <ComboboxInput
            className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-2 focus:ring-blue-500"
            displayValue={(code: ReasonCode) => 
              code ? `${code.reason_code} - ${code.reason_description}` : ''
            }
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Select reason code..."
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon />
          </ComboboxButton>
        </div>
        
        <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredCodes.length === 0 && query !== '' ? (
            <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
              Nothing found
            </div>
          ) : (
            filteredCodes.map((code) => (
              <ComboboxOption 
                key={code.reason_code} 
                value={code}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-blue-600 text-white' : 'text-gray-900'
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {code.reason_code} - {code.reason_description}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <CheckIcon />
                      </span>
                    )}
                  </>
                )}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}

// Keep your ChevronDownIcon and CheckIcon components the same
function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-gray-400"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}