import { evaluate } from "mathjs";

export const getColumnLabel = (col: number) => {
  let label = "";
  while (col >= 0) {
    label = String.fromCharCode((col % 26) + 65) + label;
    col = Math.floor(col / 26) - 1;
  }
  return label;
};

export const getCellKey = (row: number, col: number) => {
  return `${getColumnLabel(col)}${row + 1}`;
};

export const evaluateFormula = (formula: string, data: Map<string, string>) => {
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
