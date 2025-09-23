'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';

export default function CallChatDetailsModal({
  type,
  identifier,
  onClose
}: {
  type: 'calls' | 'chats';
  identifier: string;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  // You'll implement the data fetching logic here later
  // based on the details table structure you mentioned

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl rounded bg-white p-6">
          <Dialog.Title className="text-xl font-bold">
            {type === 'calls' ? 'Call' : 'Chat'} Details for {identifier}
          </Dialog.Title>
          
          <div className="mt-4">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {type === 'calls' ? 'Duration' : 'Message Count'}
                      </th>
                      {/* Add more columns based on your details structure */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(item.date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {type === 'calls' ? item.duration : item.messageCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}