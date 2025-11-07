'use client';

export default function FilterBar({ filterIssue, setFilterIssue }: any) {
  return (
    <div className="mb-6 flex gap-4">
      <button
        onClick={() => setFilterIssue('all')}
        className={`px-4 py-2 rounded-lg font-semibold transition ${
          filterIssue === 'all' 
            ? 'bg-slate-700 text-white' 
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        }`}
      >
        All Issues
      </button>
      <button
        onClick={() => setFilterIssue('Missing In')}
        className={`px-4 py-2 rounded-lg font-semibold transition ${
          filterIssue === 'Missing In' 
            ? 'bg-yellow-500 text-white' 
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        }`}
      >
        Missing In
      </button>
      <button
        onClick={() => setFilterIssue('Missing Out')}
        className={`px-4 py-2 rounded-lg font-semibold transition ${
          filterIssue === 'Missing Out' 
            ? 'bg-orange-500 text-white' 
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        }`}
      >
        Missing Out
      </button>
    </div>
  );
}
