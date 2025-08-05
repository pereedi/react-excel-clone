import { useState, useCallback, useRef } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { getColumnLabel, getCellKey, evaluateFormula } from "./utils";
import FileMenu from "./components/FileMenu";
import { exportToCSV, exportToXLSX, exportToPDF, exportToHTML } from "./components/utils/exportUtils";
import "./App.css";

// Import the API functions and types
import { createSpreadsheetAPI, updateSpreadsheetAPI, SpreadsheetData } from "./services/api";

const NUM_ROWS = 10000;
const NUM_COLS = 10000;

interface RenderCellT {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
}

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  // Keep using useRef for performance with the grid's cell data
  const dataRef = useRef(new Map<string, string>());
  
  // Add state to track the current file's ID and name from the database
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>("Untitled Sheet");

  // A simple way to force the grid to re-render when we load new data
  const [, forceUpdate] = useState({});

  // --- DATA INTERACTION ---
  const handleCellChange = useCallback(
    (row: number, col: number, value: string) => {
      const key = getCellKey(row, col);
      if (value) {
        dataRef.current.set(key, value);
      } else {
        // Optimization: remove empty cells from the map
        dataRef.current.delete(key);
      }
      forceUpdate({});
    },
    []
  );

  // --- API INTERACTION ---
  const handleSave = async () => {
  const dataToSave: SpreadsheetData = Object.fromEntries(dataRef.current);

  // Use a different log to indicate we're starting
  console.log("--- handleSave initiated ---"); 

  try {
    if (currentFileId) {
      // UPDATE Logic (we'll focus on CREATE for now)
      console.log(`Updating file with ID: ${currentFileId}...`);
      const response = await updateSpreadsheetAPI(currentFileId, currentFileName, dataToSave);
      console.log("UPDATE successful. Server response:", response);
      alert(`File "${response.data.fileName}" updated successfully!`);

    } else {
      // CREATE Logic
      console.log("CREATE logic started for file:", currentFileName);
      
      const response = await createSpreadsheetAPI(currentFileName, dataToSave);
      
      // THIS IS THE CRITICAL LOG. Do you see this?
      console.log("API call successful. Server response:", response);

      // Now let's try to access the data
      const newId = response.data._id;
      console.log("Extracted new ID:", newId);
      
      setCurrentFileId(newId);
      console.log("State updated with new ID.");

      alert(`File "${response.data.fileName}" saved successfully!`);
      console.log("--- handleSave finished successfully ---");
    }
  } catch (error) {
    // If ANY of the 'await' calls fail, it should land here.
    console.error("--- ERROR in handleSave catch block ---", error);

    // Let's inspect the error object to see if it's an axios error
    if (axios.isAxiosError(error)) {
        console.error("Axios error response:", error.response?.data);
    }
    
    alert("Error: Could not save file. Check the console for details.");
  }
};

  // NOTE: A proper "Open" feature would use a modal.
  // This is a simplified example showing how to load data.
  const handleOpen = async (fileIdToOpen: string) => {
    // This function would be called from a file selection modal
    // try {
    //   const { data: fileToLoad } = await getSpreadsheetByIdAPI(fileIdToOpen);
    //   // 2. Convert the loaded object back into a Map
    //   const newMap = new Map(Object.entries(fileToLoad.data));
    //   dataRef.current = newMap;
    //
    //   // Update file info and force a re-render
    //   setCurrentFileId(fileToLoad._id);
    //   setCurrentFileName(fileToLoad.fileName);
    //   forceUpdate({});
    // } catch (error) {
    //   alert('Failed to open file');
    // }
  };
  
   // --- NEW HANDLER FUNCTIONS ---

  const handleNewFile = () => {
    dataRef.current.clear();
    setCurrentFileId(null);
    setCurrentFileName("Untitled Sheet");
    forceUpdate({}); // Force the grid to re-render with empty data
  };

  const handleOpenFile = () => {
    // We use a hidden input element to trigger the file dialog
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json'; // For simplicity, we assume we open our own JSON format
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      try {
        const loadedData = JSON.parse(text);
        const newMap = new Map(Object.entries(loadedData));
        dataRef.current = newMap;
        setCurrentFileName(file.name.replace('.json', ''));
        setCurrentFileId(null); // It's a new local file, not from DB
        forceUpdate({});
      } catch (err) {
        alert('Error: Could not parse the file. Please ensure it is a valid JSON file.');
      }
    };
    input.click();
  };

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf' | 'html') => {
    const data = dataRef.current;
    const fileName = currentFileName;

    switch (format) {
      case 'csv':
        exportToCSV(data, fileName);
        break;
      case 'xlsx':
        exportToXLSX(data, fileName);
        break;
      case 'pdf':
        exportToPDF(data, fileName);
        break;
      case 'html':
        exportToHTML(data, fileName);
        break;
    }
  };

  // --- RENDERING ---
  const renderCell = ({ columnIndex, rowIndex, style }: RenderCellT) => {
    // ... (Your existing renderCell logic is perfect and doesn't need to change)
    if (columnIndex === 0 && rowIndex === 0) {
      return <div className="corner-header" style={style}></div>;
    }
    if (columnIndex === 0) {
      return <div className="row-header" style={style}>{rowIndex}</div>;
    }
    if (rowIndex === 0) {
      return <div className="column-header" style={style}>{getColumnLabel(columnIndex - 1)}</div>;
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
          defaultValue={displayValue} // Use defaultValue for performance with react-window
          onBlur={(e) => handleCellChange(rowIndex - 1, columnIndex - 1, e.target.value)}
          onFocus={(e) => e.target.select()}
        />
      </div>
    );
  };

  return (
    // Add a wrapper to include a header for our buttons
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <div className="app-header">
         <FileMenu onNew={handleNewFile} onOpen={handleOpenFile} onExport={handleExport} />
        <input 
          type="text"
          value={currentFileName}
          onChange={(e) => setCurrentFileName(e.target.value)}
          className="file-name-input"
        />
        <button onClick={handleSave}>Save</button>
        {/* The "Open" button would trigger a modal to select a file */}
        {/* <button onClick={() => alert('Implement file selection modal!')}>Open</button> */}
      </div>

      <div className="grid-container">
        <Grid
          columnCount={NUM_COLS + 1}
          rowCount={NUM_ROWS + 1}
          columnWidth={100}
          rowHeight={30}
          height={800} // Adjusted height to fit header
          width={1200}
          itemData={dataRef.current} // Pass data for re-render checks
          // By changing `itemData`, we tell react-window to re-render cells
          // even though we're using a ref.
        >
          {renderCell}
        </Grid>
      </div>
    </div>
  );
};

export default App;