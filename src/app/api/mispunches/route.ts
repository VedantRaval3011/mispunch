import { NextRequest, NextResponse } from 'next/server';
import { parseTimesheet } from '@/lib/excelParser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    const mispunches = await parseTimesheet(file);
    
    const analysis = {
      totalMispunches: mispunches.length,
      affectedEmployees: new Set(mispunches.map(m => m.empCode)).size,
      mispunches: mispunches.sort((a, b) => a.rowNumber - b.rowNumber),
      summary: {
        missingIn: mispunches.filter(m => m.issue === 'Missing In').length,
        missingOut: mispunches.filter(m => m.issue === 'Missing Out').length,
        oddCount: mispunches.filter(m => m.issue === 'Odd punches').length
      }
    };
    
    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to analyze file: ' + String(error) },
      { status: 500 }
    );
  }
}
