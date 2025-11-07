import * as XLSX from 'xlsx';
import { Mispunch } from './types';

export async function parseTimesheet(file: File): Promise<Mispunch[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true, cellNF: true });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  const mispunches: Mispunch[] = [];
  
  // Map to group punches by date for each employee
  interface DatePunches {
    date: string;
    startCol: number;
    punches: Array<{ col: number; type: 'In' | 'Out'; value: any }>;
  }
  
  // First pass: Find all unique dates and their column ranges
  const dateColumns = new Map<string, number[]>();
  
  for (let col = 4; col < 160; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 8, c: col }); // Row 9 (0-indexed: 8)
    const subHeaderRef = XLSX.utils.encode_cell({ r: 12, c: col }); // Row 13
    
    const dateValue = worksheet[cellRef]?.v;
    const subHeader = worksheet[subHeaderRef]?.v;
    
    if (dateValue) {
      let dateStr: string;
      if (dateValue instanceof Date) {
        dateStr = formatDate(dateValue);
      } else {
        dateStr = String(dateValue).trim();
      }
      
      if (!dateColumns.has(dateStr)) {
        dateColumns.set(dateStr, []);
      }
      dateColumns.get(dateStr)!.push(col);
    }
    
    // Also track columns that belong to the previous date (no date header but have In/Out)
    if (!dateValue && subHeader && (subHeader === 'In' || subHeader === 'Out')) {
      // Find the most recent date
      for (let backCol = col - 1; backCol >= 4; backCol--) {
        const backDateRef = XLSX.utils.encode_cell({ r: 8, c: backCol });
        const backDateValue = worksheet[backDateRef]?.v;
        if (backDateValue) {
          let dateStr: string;
          if (backDateValue instanceof Date) {
            dateStr = formatDate(backDateValue);
          } else {
            dateStr = String(backDateValue).trim();
          }
          if (!dateColumns.get(dateStr)!.includes(col)) {
            dateColumns.get(dateStr)!.push(col);
          }
          break;
        }
      }
    }
  }
  
  // Process employees starting from row 14 (0-indexed: row 13)
  let rowIdx = 13;
  
  while (true) {
    const empCodeCell = XLSX.utils.encode_cell({ r: rowIdx, c: 0 });
    const empNameCell = XLSX.utils.encode_cell({ r: rowIdx, c: 2 });
    
    const empCode = worksheet[empCodeCell]?.v;
    const empName = worksheet[empNameCell]?.v;
    
    if (!empCode || !empName) break;
    
    // For each date, count all In and Out punches
    for (const [dateStr, columns] of dateColumns.entries()) {
      const punches: Array<{ type: string; time: any }> = [];
      
      for (const col of columns) {
        const subHeaderRef = XLSX.utils.encode_cell({ r: 12, c: col });
        const cellRef = XLSX.utils.encode_cell({ r: rowIdx, c: col });
        
        const subHeader = worksheet[subHeaderRef]?.v;
        const cellValue = worksheet[cellRef]?.v;
        
        if (cellValue && (subHeader === 'In' || subHeader === 'Out')) {
          punches.push({
            type: subHeader,
            time: cellValue
          });
        }
      }
      
      // Check if punch count is odd
      if (punches.length > 0 && punches.length % 2 === 1) {
        // Determine issue type
        const inCount = punches.filter(p => p.type === 'In').length;
        const outCount = punches.filter(p => p.type === 'Out').length;
        
        let issue: 'Missing In' | 'Missing Out' | 'Odd punches';
        if (inCount > outCount) {
          issue = 'Missing Out';
        } else if (outCount > inCount) {
          issue = 'Missing In';
        } else {
          issue = 'Odd punches';
        }
        
        // Get first In and last Out for display
        const firstIn = punches.find(p => p.type === 'In');
        const lastOut = punches.filter(p => p.type === 'Out').pop();
        
        mispunches.push({
          rowNumber: rowIdx + 1,
          empCode: String(empCode),
          empName: String(empName),
          date: dateStr,
          inTime: firstIn ? formatTime(firstIn.time) : 'Missing',
          outTime: lastOut ? formatTime(lastOut.time) : 'Missing',
          punchCount: punches.length,
          issue
        });
      }
    }
    
    rowIdx++;
  }
  
  return mispunches;
}

function formatDate(date: Date | string): string {
  if (date instanceof Date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return String(date);
}

function formatTime(date: Date | string): string {
  if (date instanceof Date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  return String(date);
}
