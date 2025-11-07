'use client';

import { useState } from 'react';
import UploadForm from './components/UploadForm';
import MispunchTable from './components/MispunchTable';
import FilterBar from './components/FilterBar';
import { AnalysisResult, Mispunch } from '@/lib/types';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterIssue, setFilterIssue] = useState<string>('all');

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/mispunches', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to analyze file');
    } finally {
      setLoading(false);
    }
  };

  const filteredMispunches = analysisResult?.mispunches.filter(m => 
    filterIssue === 'all' || m.issue === filterIssue
  ) || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Punch Mispunch Detector
          </h1>
          <p className="text-slate-300">
            Identify employees with odd In+Out punch counts
          </p>
        </div>

        <UploadForm onFileUpload={handleFileUpload} loading={loading} />

        {analysisResult && (
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <StatCard 
                label="Total Mispunches" 
                value={analysisResult.totalMispunches}
                color="bg-red-500"
              />
              <StatCard 
                label="Affected Employees" 
                value={analysisResult.affectedEmployees}
                color="bg-orange-500"
              />
              <StatCard 
                label="Missing In" 
                value={analysisResult.summary.missingIn}
                color="bg-yellow-500"
              />
              <StatCard 
                label="Missing Out" 
                value={analysisResult.summary.missingOut}
                color="bg-blue-500"
              />
            </div>

            <FilterBar 
              filterIssue={filterIssue}
              setFilterIssue={setFilterIssue}
            />
            
            <MispunchTable mispunches={filteredMispunches} />
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div className={`${color} rounded-lg p-6 text-white shadow-lg`}>
      <p className="text-sm font-semibold opacity-90">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
