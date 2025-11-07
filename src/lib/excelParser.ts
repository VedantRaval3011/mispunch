import * as XLSX from 'xlsx';
import { Mispunch } from './types';

export async function parseTimesheet(file: File): Promise<Mispunch[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true, cellNF: true });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  const mispunches: Mispunch[] = [];
  
  // Find all data sections with employees
  const dataSections: Array<{ startRow: number; endRow: number }> = [];
  
  for (let row = 0; row < 300; row++) {
    const cellValue = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })]?.v;
    if (cellValue && String(cellValue).includes('EMP Code')) {
      let endRow = row + 1;
      
      for (let checkRow = row + 1; checkRow < 300; checkRow++) {
        const empCode = worksheet[XLSX.utils.encode_cell({ r: checkRow, c: 0 })]?.v;
        const empName = worksheet[XLSX.utils.encode_cell({ r: checkRow, c: 2 })]?.v;
        
        // ✅ Skip if undefined/null
        if (!empCode || !empName) {
          continue;
        }
        
        if (empCode && empName) {
          endRow = checkRow;
        } else if (
          (empCode && String(empCode).includes('Company')) ||
          (empCode && String(empCode).includes('Department'))
        ) {
          break;
        }
      }
      
      if (endRow > row + 1) {
        dataSections.push({ startRow: row + 1, endRow });
      }
    }
  }
  
  // Process all employees from all sections
  for (const section of dataSections) {
    for (let rowIdx = section.startRow; rowIdx <= section.endRow; rowIdx++) {
      const empCodeCell = XLSX.utils.encode_cell({ r: rowIdx, c: 0 });
      const empNameCell = XLSX.utils.encode_cell({ r: rowIdx, c: 2 });
      
      const empCode = worksheet[empCodeCell]?.v;
      const empName = worksheet[empNameCell]?.v;
      
      // ✅ Skip if empCode or empName is undefined/null
      if (!empCode || !empName) {
        continue;
      }
      
      // ✅ Skip if empCode is a string (header/label rows)
      if (typeof empCode === 'string') {
        if (empCode.includes('Company') || empCode.includes('Department') || empCode.includes('EMP')) {
          continue;
        }
      }
      
      // ✅ Group punches by ACTUAL date from timestamp, not header
      const dateGroups = new Map<string, Array<{ type: string; time: any }>>();
      
      for (let col = 4; col < 160; col++) {
        const subHeaderRef = XLSX.utils.encode_cell({ r: 12, c: col }); // Row 13 (In/Out)
        const cellRef = XLSX.utils.encode_cell({ r: rowIdx, c: col });
        
        const subHeader = worksheet[subHeaderRef]?.v;
        const cellValue = worksheet[cellRef]?.v;
        
        // ✅ Skip if undefined/null
        if (!cellValue || !subHeader) {
          continue;
        }
        
        // ✅ Only process In or Out types
        if (subHeader !== 'In' && subHeader !== 'Out') {
          continue;
        }
        
        // ✅ Extract actual date from the timestamp
        let actualDate: string;
        if (cellValue instanceof Date) {
          actualDate = formatDate(cellValue);
        } else {
          actualDate = String(cellValue).trim();
        }
        
        // ✅ Skip if actualDate is empty or 'undefined'
        if (!actualDate || actualDate === 'undefined' || actualDate === 'Invalid Date') {
          continue;
        }
        
        if (!dateGroups.has(actualDate)) {
          dateGroups.set(actualDate, []);
        }
        dateGroups.get(actualDate)!.push({
          type: subHeader,
          time: cellValue
        });
      }
      
      // Check each date for odd punch counts
      for (const [dateStr, punches] of dateGroups.entries()) {
        // ✅ Skip if no punches (0 count = absent, ignore)
        if (punches.length === 0) {
          continue;
        }
        
        // ✅ Only flag as mispunch if count is ODD and > 0
        if (punches.length % 2 === 1) {
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
          
          // ✅ Skip if firstIn or lastOut is undefined
          if (!firstIn || !lastOut) {
            continue;
          }
          
          mispunches.push({
            rowNumber: rowIdx + 1,
            empCode: String(empCode),
            empName: String(empName),
            date: dateStr,
            inTime: formatTime(firstIn.time),
            outTime: formatTime(lastOut.time),
            punchCount: punches.length,
            issue
          });
        }
      }
    }
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
