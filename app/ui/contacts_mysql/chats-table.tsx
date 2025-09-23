'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface Chat {
  chatid: string;
  email: string;
  agentextension: string;
  subject: string;
  description: string;
  chatdatetime: Date;
  chatduration: number;
}

export default function ChatsTable({ chats }: { chats: Chat[] }) {
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  const toggleDescription = (chatid: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [chatid]: !prev[chatid]
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
                  <th scope="col" className="px-4 py-5 font-medium sm:pl-6">Chat ID</th>
                  <th scope="col" className="px-3 py-5 font-medium">Email</th>
                  <th scope="col" className="px-3 py-5 font-medium">Agent</th>
                  <th scope="col" className="px-3 py-5 font-medium">Subject</th>
                  <th scope="col" className="px-3 py-5 font-medium">Date/Time</th>
                  <th scope="col" className="px-3 py-5 font-medium">Duration</th>
                  <th scope="col" className="px-3 py-5 font-medium">Description</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 text-gray-900">
                {chats.map((chat) => (
                  <tr key={chat.chatid} className="group hover:bg-gray-100">
                    <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                      {chat.chatid}
                    </td>
                    <td className="whitespace-nowrap bg-white px-3 py-5 text-sm">
                      {chat.email}
                    </td>
                    <td className="whitespace-nowrap bg-white px-3 py-5 text-sm">
                      {chat.agentextension}
                    </td>
                    <td className="whitespace-nowrap bg-white px-3 py-5 text-sm">
                      {chat.subject}
                    </td>
                    <td className="whitespace-nowrap bg-white px-3 py-5 text-sm">
                      {format(new Date(chat.chatdatetime), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="whitespace-nowrap bg-white px-3 py-5 text-sm">
                      {chat.chatduration} sec
                    </td>
                    <td className="bg-white px-3 py-5 text-sm">
                      <div className={`${expandedDescriptions[chat.chatid] ? '' : 'line-clamp-2'} max-w-prose`}>
                        {chat.description}
                      </div>
                      {chat.description.length > 100 && (
                        <button 
                          onClick={() => toggleDescription(chat.chatid)}
                          className="text-blue-600 hover:underline text-sm mt-1"
                        >
                          {expandedDescriptions[chat.chatid] ? 'Show less' : '...more'}
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