'use client';

import { Mispunch } from '@/lib/types';

export default function MispunchTable({ mispunches }: { mispunches: Mispunch[] }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
