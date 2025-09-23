'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface Call {
  callid: string;
  contactnumber: string;
  agentextension: string;
  description: string;
  calldatetime: Date;
  callduration: number;
}

export default function CallsTable({ calls }: { calls: Call[] }) {
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  const toggleDescription = (callid: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [callid]: !prev[callid]
    }));
  };

  return (
    <div className="mt-6 flow-root">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
            <table className="min-w-full rounded-md text-gray-900">
              <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                <tr>
                  <th scope="col" className="px-4 py-5 font-medium sm:pl-6">Call ID</th>
                  <th scope="col" className="px-3 py-5 font-medium">Agent</th>
                  <th scope="col" className="px-3 py-5 font-medium">Date/Time</th>
                  <th scope="col" className="px-3 py-5 font-medium">Duration</th>
                  <th scope="col" className="px-3 py-5 font-medium">Description</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 text-gray-900">
                {calls.map((call) => (
                  <tr key={call.callid} className="group hover:bg-gray-100">
                    <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                      {call.callid}
                    </td>
                    <td className="whitespace-nowrap bg-white px-3 py-5 text-sm">
                      {call.agentextension}
                    </td>
                    <td className="whitespace-nowrap bg-white px-3 py-5 text-sm">
                      {format(new Date(call.calldatetime), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="whitespace-nowrap bg-white px-3 py-5 text-sm">
                      {call.callduration} sec
                    </td>
                    <td className="bg-white px-3 py-5 text-sm">
                      <div className={`${expandedDescriptions[call.callid] ? '' : 'line-clamp-2'} max-w-prose`}>
                        {call.description}
                      </div>
                      {call.description.length > 100 && (
                        <button 
                          onClick={() => toggleDescription(call.callid)}
                          className="text-blue-600 hover:underline text-sm mt-1"
                        >
                          {expandedDescriptions[call.callid] ? 'Show less' : '...more'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}