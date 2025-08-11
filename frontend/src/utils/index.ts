import { evaluate } from "mathjs";

/**
 * Converts a zero-based column index to an Excel-style column label (A, B, C...).
 */
export const getColumnLabel = (col: number): string => {
  let label = "";
  while (col >= 0) {
    label = String.fromCharCode((col % 26) + 65) + label;
    col = Math.floor(col / 26) - 1;
  }
  return label;
};

/**
 * Creates a standard cell key (e.g., "A1", "B2") from row and column indices.
 */
export const getCellKey = (row: number, col: number): string => {
  return `${getColumnLabel(col)}${row + 1}`;
};

/**
 * Evaluates a formula string (e.g., "=A1+B2") by replacing cell references with their values.
 */
export const evaluateFormula = (formula: string, data: Map<string, string>): string | number => {
  try {
    if (formula.startsWith("=")) {
      const expr = formula
        .slice(1)
        .replace(/([A-Z]+)([0-9]+)/g, (_, col, row) => {
          const key = `${col}${row}`;
          return data.get(key) || "0";
        });
      return evaluate(expr);
    }
    return formula;
  } catch {
    return "ERROR";
  }
};