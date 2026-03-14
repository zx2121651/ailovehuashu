import React from 'react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
       <div className="bg-gray-900/80 backdrop-blur-sm text-white px-4 py-2.5 rounded-lg text-sm shadow-xl font-medium animate-in fade-in zoom-in-95 duration-200">
         {message}
       </div>
    </div>
  );
}
