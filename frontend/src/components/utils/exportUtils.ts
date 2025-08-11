import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- NEW HELPER FUNCTION ---
/**
 * Converts an Excel-style column label (e.g., "A", "B", "AA") to a zero-based index.
 * @param label The column label.
 * @returns The zero-based column index.
 */
const colLabelToIndex = (label: string): number => {
  let index = 0;
  for (let i = 0; i < label.length; i++) {
    index = index * 26 + (label.charCodeAt(i) - 64);
  }
  return index - 1;
};

// --- REWRITTEN CORE FUNCTION ---
/**
 * Converts the spreadsheet Map data into a true 2D grid array, including headers.
 * @param data The Map object holding the spreadsheet data.
 * @returns A 2D string array representing the grid.
 */
const mapToGridArray = (data: Map<string, string>): string[][] => {
  if (data.size === 0) return [[]];

  let maxRow = 0;
  let maxCol = 0;

  // 1. Determine the grid dimensions by finding the max row and column used.
  for (const key of data.keys()) {
    const match = key.match(/([A-Z]+)(\d+)/);
    if (match) {
      const colIndex = colLabelToIndex(match[1]);
      const rowIndex = parseInt(match[2], 10) - 1; // 0-based index

      if (rowIndex > maxRow) maxRow = rowIndex;
      if (colIndex > maxCol) maxCol = colIndex;
    }
  }

  // 2. Create an empty 2D array with the correct dimensions (+1 for headers).
  const grid: string[][] = Array(maxRow + 2).fill(null).map(() => Array(maxCol + 2).fill(''));

  // 3. Add column headers (A, B, C...) to the first row.
  for (let c = 0; c <= maxCol; c++) {
    // We need a reverse of getColumnLabel here. Let's assume a simple one for now.
    let colLabel = '';
    let tempCol = c;
    while(tempCol >= 0) {
        colLabel = String.fromCharCode(tempCol % 26 + 65) + colLabel;
        tempCol = Math.floor(tempCol/26) - 1;
    }
    grid[0][c + 1] = colLabel;
  }

  // 4. Add row headers (1, 2, 3...) to the first column.
  for (let r = 0; r <= maxRow; r++) {
    grid[r + 1][0] = (r + 1).toString();
  }
  
  // 5. Populate the grid with the actual data.
  for (const [key, value] of data.entries()) {
    const match = key.match(/([A-Z]+)(\d+)/);
    if (match) {
      const colIndex = colLabelToIndex(match[1]);
      const rowIndex = parseInt(match[2], 10) - 1;
      
      // Place the value in the grid, offsetting by 1 for the headers.
      grid[rowIndex + 1][colIndex + 1] = value;
    }
  }

  return grid;
};

// --- UPDATED EXPORT FUNCTIONS ---

// Generic download function (no changes needed)
const downloadFile = (blob: Blob, fileName: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToCSV = (data: Map<string, string>, fileName: string) => {
  const grid = mapToGridArray(data);
  const ws = XLSX.utils.aoa_to_sheet(grid);
  const csvString = XLSX.utils.sheet_to_csv(ws, { header: 1 }); // Use header:1 to skip our custom headers
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `${fileName}.csv`);
};

export const exportToXLSX = (data: Map<string, string>, fileName: string) => {
  const grid = mapToGridArray(data);
  const ws = XLSX.utils.aoa_to_sheet(grid);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPDF = (data: Map<string, string>, fileName: string) => {
  const doc = new jsPDF({ orientation: 'landscape' }); // Landscape is better for wide sheets
  const grid = mapToGridArray(data);
  
  autoTable(doc, {
    // The `head` is the first row of our grid. `body` is the rest.
    head: [grid[0]],
    body: grid.slice(1), 
    theme: 'grid',
    styles: { fontSize: 8 },
  });

  doc.save(`${fileName}.pdf`);
};

export const exportToHTML = (data: Map<string, string>, fileName: string) => {
    const grid = mapToGridArray(data);
    let htmlString = `
      <!DOCTYPE html>
      <html>
      <head><title>${fileName}</title><style>table, th, td { border: 1px solid black; border-collapse: collapse; padding: 5px; font-family: sans-serif; } th { background-color: #f2f2f2; }</style></head>
      <body>
        <h1>${fileName}</h1>
        <table>
          <thead>
            <tr>${grid[0].map(cell => `<th>${cell}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${grid.slice(1).map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8;' });
    downloadFile(blob, `${fileName}.html`);
};