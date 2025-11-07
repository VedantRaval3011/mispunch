'use client';

import { useRef } from 'react';

export default function UploadForm({ onFileUpload, loading }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.xlsx')) {
      onFileUpload(file);
    } else {
      alert('Please select an Excel (.xlsx) file');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        onChange={handleChange}
        className="hidden"
        disabled={loading}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition"
      >
        {loading ? 'Analyzing...' : 'Upload Timesheet (Excel)'}
      </button>
    </div>
  );
}
