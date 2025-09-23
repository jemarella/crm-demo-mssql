// app/ui/contacts/interactive-counters.tsx
'use client';

import { useState, useEffect } from 'react';
import Modal from '@/app/ui/contacts/modal';
import CallsTable from '@/app/ui/contacts/calls-table';
import ChatsTable from '@/app/ui/contacts/chats-table';
import { getCallCount, getChatCount } from '@/app/lib/services/contactService';

export function InteractiveCounters({
  phoneNumber,
  email,
  contactName,
  initialCallCount = 0,
  initialChatCount = 0
}: {
  phoneNumber?: string;
  email?: string;
  contactName: string;
  initialCallCount?: number;
  initialChatCount?: number;
}) {
  const [callCount, setCallCount] = useState(initialCallCount);
  const [chatCount, setChatCount] = useState(initialChatCount);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<{
    type: 'calls' | 'chats';
    data: any[];
    title: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Refresh counts when phoneNumber or email changes
  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoading(true);
      try {
        if (phoneNumber) {
          const calls = await getCallCount(phoneNumber);
          setCallCount(calls);
        }
        if (email) {
          const chats = await getChatCount(email);
          setChatCount(chats);
        }
      } catch (error) {
        console.error('Error fetching interaction counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [phoneNumber, email]);

  const handleShowCalls = async () => {
    if (!phoneNumber) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/calls?phoneNumber=${encodeURIComponent(phoneNumber)}`);
      const calls = await res.json();
      setModalContent({
        type: 'calls',
        data: calls,
        title: `Call History for ${contactName}`
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowChats = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chats?email=${encodeURIComponent(email)}`);
      const chats = await res.json();
      setModalContent({
        type: 'chats',
        data: chats,
        title: `Chat History for ${contactName}`
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="p-4 bg-white rounded-md shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Call History</h3>
            <button
              onClick={handleShowCalls}
              className="text-blue-600 hover:underline font-medium"
              disabled={!phoneNumber || isLoading}
            >
              {isLoading ? '...' : callCount}
            </button>
          </div>
          {phoneNumber && (
            <p className="text-xs text-gray-500 mt-1">
              {phoneNumber}
            </p>
          )}
        </div>

        <div className="p-4 bg-white rounded-md shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Chat History</h3>
            <button
              onClick={handleShowChats}
              className="text-blue-600 hover:underline font-medium"
              disabled={!email || isLoading}
            >
              {isLoading ? '...' : chatCount}
            </button>
          </div>
          {email && (
            <p className="text-xs text-gray-500 mt-1">
              {email}
            </p>
          )}
        </div>
      </div>

      {showModal && modalContent && (
        <Modal 
          title={modalContent.title}
          onClose={() => setShowModal(false)}
        >
          {modalContent.type === 'calls' ? (
            <CallsTable calls={modalContent.data} />
          ) : (
            <ChatsTable chats={modalContent.data} />
          )}
        </Modal>
      )}
    </>
  );
}