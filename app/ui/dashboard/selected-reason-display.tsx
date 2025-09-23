'use client';

import { useReasonCode } from '@/app/lib/hooks/use-reason-code';

export default function SelectedReasonDisplay() {
  const { selectedCode } = useReasonCode();

  if (!selectedCode) {
    return null;
  }

  return (
    <div className="rounded-md bg-green-500 px-4 py-2 text-white shadow-lg">
      <span className="font-medium">Selected Reason:</span> {selectedCode.reason_description}
    </div>
  );
}