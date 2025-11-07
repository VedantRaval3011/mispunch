export interface Mispunch {
  rowNumber: number;
  empCode: string;
  empName: string;
  date: string;
  inTime: string;
  outTime: string;
  punchCount: number;
  issue: 'Missing In' | 'Missing Out' | 'Odd punches';
}

export interface AnalysisResult {
  totalMispunches: number;
  affectedEmployees: number;
  mispunches: Mispunch[];
  summary: {
    missingIn: number;
    missingOut: number;
    oddCount: number;
  };
}
