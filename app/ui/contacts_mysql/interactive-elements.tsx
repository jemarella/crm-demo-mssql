// app/ui/contacts/interactive-elements.tsx
'use client';

import { useState } from 'react';
import Modal from '@/app/ui/contacts/modal';
import CallsTable from '@/app/ui/contacts/calls-table';
import ChatsTable from '@/app/ui/contacts/chats-table';

export function InteractiveElements({
  phoneNumber,
  email,
  contactName,
  callCount,
  chatCount,
  variant = 'table' // 'table' or 'form'
}: {
  phoneNumber?: string;
  email?: string;
  contactName: string;
  callCount: number;
  chatCount: number;
  variant?: 'table' | 'form';
}) {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<{
    type: 'calls' | 'chats';
    data: any[];
    title: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  if (variant === 'form') {
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

  // Default table variant
  return (
    <>
      <div className="flex gap-6">
        <div className="text-center">
          <button
            onClick={handleShowCalls}
            className="text-blue-600 hover:underline font-medium block cursor-pointer"
            disabled={!phoneNumber || isLoading}
          >
            {isLoading ? '...' : callCount}
          </button>
          <span className="text-xs text-gray-500">Calls</span>
        </div>
        <div className="text-center">
          <button
            onClick={handleShowChats}
            className="text-blue-600 hover:underline font-medium block cursor-pointer"
            disabled={!email || isLoading}
          >
            {isLoading ? '...' : chatCount}
          </button>
          <span className="text-xs text-gray-500">Chats</span>
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