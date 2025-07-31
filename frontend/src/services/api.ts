import axios from 'axios';

// The local backend URL
const API_URL = 'http://localhost:5001/api/spreadsheets';

// Define the shape of the data we expect to save/load
// This is based on your useRef(new Map<string, string>())
export interface SpreadsheetData {
  [key: string]: string;
}

export interface SpreadsheetDoc {
  _id: string;
  fileName: string;
  data: SpreadsheetData;
  createdAt: string;
  updatedAt: string;
}

// When you save a new file for the first time
export const createSpreadsheetAPI = (fileName: string, data: SpreadsheetData): Promise<{ data: SpreadsheetDoc }> => {
  return axios.post(API_URL, { fileName, data });
};

// When you save an existing file
export const updateSpreadsheetAPI = (id: string, fileName: string, data: SpreadsheetData): Promise<{ data: SpreadsheetDoc }> => {
  return axios.put(`${API_URL}/${id}`, { fileName, data });
};

// To get a list of all saved files
export const getSpreadsheetsAPI = (): Promise<{ data: Pick<SpreadsheetDoc, '_id' | 'fileName' | 'updatedAt'>[] }> => {
  return axios.get(API_URL);
};

// When you open a file by its ID
export const getSpreadsheetByIdAPI = (id: string): Promise<{ data: SpreadsheetDoc }> => {
  return axios.get(`${API_URL}/${id}`);
};