import { formatDateToLocal } from '@/app/lib/utils';
import { format } from 'date-fns'
interface Chat {
  chatid: number;
  email: string;
  agentextension: string;
  subject: string;
  description: string;
  calldatetime: Date;
  callduration: string;
}

interface ChatsTableProps {
  chats: Chat[];
  contactName: string;
  email: string;
}

export default function ChatsTable({ chats, contactName, email }: ChatsTableProps) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {chats?.map((chat) => (
              <div key={chat.chatid} className="mb-2 w-full rounded-md bg-white p-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-sm font-medium">Chat ID: {chat.chatid}</p>
                    <p className="text-sm text-gray-500">Subject: {chat.subject}</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-sm">Date: {format(new Date(chat.calldatetime), 'MMM dd, yyyy HH:mm')}</p>
                    <p className="text-sm">Agent: {chat.agentextension}</p>
                    <p className="text-sm mt-2">{chat.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Chat ID
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date & Time
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Subject
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Agent
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {chats?.map((chat) => (
                <tr
                  key={chat.chatid}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {chat.chatid}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {format(new Date(chat.calldatetime), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {chat.subject}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {chat.agentextension}
                  </td>
                  <td className="px-3 py-3">
                    {chat.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}