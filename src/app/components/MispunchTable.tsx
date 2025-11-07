'use client';

import { Mispunch } from '@/lib/types';
import * as XLSX from 'xlsx';

export default function MispunchTable({ mispunches }: { mispunches: Mispunch[] }) {
  // ✅ Export to Excel function (with formatting)
  const exportToExcel = () => {
    if (mispunches.length === 0) {
      alert('No mispunches to export');
      return;
    }

    // Create data array
    const data = mispunches.map(m => ({
      'Row': m.rowNumber,
      'Emp Code': m.empCode,
      'Employee Name': m.empName,
      'Date': m.date,
      'First In': m.inTime,
      'Last Out': m.outTime,
      'Total Punches': m.punchCount,
      'Issue': m.issue
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mispunches');

    // ✅ Add column widths for better readability
    worksheet['!cols'] = [
      { wch: 8 },  // Row
      { wch: 12 }, // Emp Code
      { wch: 20 }, // Employee Name
      { wch: 12 }, // Date
      { wch: 12 }, // First In
      { wch: 12 }, // Last Out
      { wch: 15 }, // Total Punches
      { wch: 15 }  // Issue
    ];

    // Generate filename with date
    const filename = `mispunches_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Write file
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* ✅ Export Button */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">
          Mispunches ({mispunches.length})
        </h3>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          
          Export to Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Row</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Emp Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Employee Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">First In</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Last Out</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Total Punches</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Issue</th>
            </tr>
          </thead>
          <tbody>
            {mispunches.map((m, idx) => (
              <tr key={idx} className="border-b hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-900">{m.rowNumber}</td>
                <td className="px-6 py-4 text-sm text-slate-900">{m.empCode}</td>
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">{m.empName}</td>
                <td className="px-6 py-4 text-sm text-slate-900">{m.date}</td>
                <td className="px-6 py-4 text-sm text-slate-900">{m.inTime}</td>
                <td className="px-6 py-4 text-sm text-slate-900">{m.outTime}</td>
                <td className="px-6 py-4 text-sm text-slate-900 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold">
                    {m.punchCount}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                    m.issue === 'Missing In' ? 'bg-yellow-500' :
                    m.issue === 'Missing Out' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}>
                    {m.issue}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
