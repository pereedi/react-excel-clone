import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getColumnLabel, getCellKey } from '../../utils'; // Assuming these are exported from your existing utils

// Helper to convert Map data to a 2D array
const mapTo2DArray = (data: Map<string, string>): string[][] => {
  if (data.size === 0) return [];
  
  let maxRow = 0;
  let maxCol = 0;

  // Determine the bounds of the sheet
  for (const key of data.keys()) {
    const match = key.match(/([A-Z]+)(\d+)/);
    if (match) {
      const colStr = match[1];
      const row = parseInt(match[2], 10);
      
      // A simple way to estimate column index from letters
      let col = 0;
      for (let i = 0; i < colStr.length; i++) {
        col = col * 26 + (colStr.charCodeAt(i) - 64);
      }

      if (row > maxRow) maxRow = row;
      if (col > maxCol) maxCol = col;
    }
  }

  const array: string[][] = Array(maxRow + 1).fill(null).map(() => Array(maxCol + 1).fill(''));

  // Add headers
  for (let c = 0; c < maxCol; c++) {
    array[0][c + 1] = getColumnLabel(c);
  }
  for (let r = 0; r < maxRow; r++) {
    array[r + 1][0] = (r + 1).toString();
  }

  // Populate data
  for (const [key, value] of data.entries()) {
     const match = key.match(/([A-Z]+)(\d+)/);
     if (match) {
        const row = parseInt(match[2], 10);
        // Simple column estimation
        let col = 0;
        for (let i = 0; i < match[1].length; i++) {
          col = col * 26 + (match[1].charCodeAt(i) - 64);
        }
        if(array[row+1] && array[row+1][col] !== undefined) {
          array[row+1][col] = value;
        }
     }
  }
  
  // A simplified version for direct conversion
  const simpleArray: string[][] = [];
  data.forEach((value, key) => {
      // For simplicity, we just dump key-value. A real implementation would be more grid-like.
      simpleArray.push([key, value]);
  })
  return simpleArray;
};


// Generic download function
const downloadFile = (blob: Blob, fileName: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToCSV = (data: Map<string, string>, fileName: string) => {
  const ws = XLSX.utils.aoa_to_sheet(mapTo2DArray(data));
  const csvString = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `${fileName}.csv`);
};

export const exportToXLSX = (data: Map<string, string>, fileName: string) => {
  const ws = XLSX.utils.aoa_to_sheet(mapTo2DArray(data));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${fileName}.xlsx`); // SheetJS has a direct writer for this
};

export const exportToPDF = (data: Map<string, string>, fileName: string) => {
  const doc = new jsPDF();
  (doc as any).autoTable({
    head: [['Cell Key', 'Value']],
    body: mapTo2DArray(data),
  });
  doc.save(`${fileName}.pdf`);
};

export const exportToHTML = (data: Map<string, string>, fileName: string) => {
    let htmlString = `
      <!DOCTYPE html>
      <html>
      <head><title>${fileName}</title><style>table, th, td { border: 1px solid black; border-collapse: collapse; padding: 5px; }</style></head>
      <body>
        <h1>${fileName}</h1>
        <table>
          <thead><tr><th>Cell Key</th><th>Value</th></tr></thead>
          <tbody>
    `;
    mapTo2DArray(data).forEach(([key, value]) => {
      htmlString += `<tr><td>${key}</td><td>${value}</td></tr>`;
    });
    htmlString += `
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8;' });
    downloadFile(blob, `${fileName}.html`);
};