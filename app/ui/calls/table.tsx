//import { formatDateToLocal } from '@/app/lib/utils';
import { format } from 'date-fns';

interface Call {
  callid: number;
  contactnumber: string;
  agentextension: string;
  description: string;
  calldatetime: Date;
  callduration: string;
  agentfirstname: string;
  agentlastname: string;
}

interface CallsTableProps {
  calls: Call[];
  contactName: string;
  phoneNumber: string;
}

export default function CallsTable({ calls, contactName, phoneNumber }: CallsTableProps) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {calls?.map((call) => (
              <div key={call.callid} className="mb-2 w-full rounded-md bg-white p-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-sm font-medium">Call ID: {call.callid}</p>
                    <p className="text-sm text-gray-500">Agent: {call.agentextension}</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-sm">Date: {format(new Date(call.calldatetime), 'MMM dd, yyyy HH:mm')}</p>
                    <p className="text-sm">Duration: {call.callduration}</p>
                    <p className="text-sm mt-2">{call.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Call ID
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date & Time
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Duration
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Agent Ext
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Agent Name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Agent LastName
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {calls?.map((call) => (
                <tr
                  key={call.callid}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {call.callid}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {format(new Date(call.calldatetime), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {call.callduration}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {call.agentextension}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {call.agentfirstname}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {call.agentlastname}
                  </td>
                  <td className="px-3 py-3">
                    {call.description}
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