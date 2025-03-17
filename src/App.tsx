import { useState, useCallback, useRef } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { getColumnLabel, getCellKey, evaluateFormula } from "./utils";
import "./App.css";

const NUM_ROWS = 10000;
const NUM_COLS = 10000;

interface RenderCellT {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
}

const App: React.FC = () => {
  const dataRef = useRef(new Map<string, string>());
  const [, forceUpdate] = useState({});

  const handleCellChange = useCallback(
    (row: number, col: number, value: string) => {
      const key = getCellKey(row, col);
      dataRef.current.set(key, value);
      forceUpdate({});
    },
    []
  );

  const renderCell = ({ columnIndex, rowIndex, style }: RenderCellT) => {
    if (columnIndex === 0 && rowIndex === 0) {
      return <div className="corner-header" style={style}></div>;
    }
    if (columnIndex === 0) {
      return (
        <div className="row-header" style={style}>
          {rowIndex}
        </div>
      );
    }
    if (rowIndex === 0) {
      return (
        <div className="column-header" style={style}>
          {getColumnLabel(columnIndex - 1)}
        </div>
      );
    }
    const key = getCellKey(rowIndex - 1, columnIndex - 1);
    const rawValue = dataRef.current.get(key) || "";
    const displayValue = rawValue.startsWith("=")
      ? evaluateFormula(rawValue, dataRef.current) || "ERROR"
      : rawValue;

    return (
      <div className="cell" style={style}>
        <input
          type="text"
          defaultValue={displayValue}
          onBlur={(e) =>
            handleCellChange(rowIndex - 1, columnIndex - 1, e.target.value)
          }
          onFocus={(e) => e.target.select()}
        />
      </div>
    );
  };

  return (
    <div className="grid-container">
      <Grid
        columnCount={NUM_COLS + 1}
        rowCount={NUM_ROWS + 1}
        columnWidth={100}
        rowHeight={30}
        height={1000}
        width={1200}
        itemData={dataRef.current}
      >
        {renderCell}
      </Grid>
    </div>
  );
};

export default App;
