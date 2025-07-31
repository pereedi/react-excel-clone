// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const spreadsheetRoutes = require('./routes/spreadsheetRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable CORS
// This tells the backend to allow requests from your local React app.
const corsOptions = {
  origin: 'http://localhost:5173', // Your frontend's origin
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
// Body parser middleware
// Allows us to accept JSON data in the body
app.use(express.json({ limit: '50mb' })); // Increase limit for large spreadsheet data
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Mount routers
app.use('/api/spreadsheets', spreadsheetRoutes);

// Simple health check route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));