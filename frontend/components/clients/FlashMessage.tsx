'use client';

import { useEffect } from 'react';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none" className="size-[18px]">
    <circle cx="9" cy="9" r="9" fill="#059669" />
    <path
      d="M5.5 9l2.5 2.5 4.5-5"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none" className="size-[18px]">
    <circle cx="9" cy="9" r="9" fill="#dc2626" />
    <path
      d="M6 6l6 6M6 12l6-6"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

interface FlashMessageProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function FlashMessage({ message, type, onClose }: FlashMessageProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-red-50 border-red-200 text-red-700'
      }`}
    >
      {isSuccess ? <CheckIcon /> : <XIcon />}
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-auto flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Fechar"
      >
        &times;
      </button>
    </div>
  );
}
