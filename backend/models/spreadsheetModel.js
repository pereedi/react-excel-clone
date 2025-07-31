// backend/models/spreadsheetModel.js
const mongoose = require('mongoose');

const spreadsheetSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, 'Please provide a file name'],
      trim: true,
    },
    // The 'data' field will store the entire Redux state object from the frontend.
    // Mongoose.Schema.Types.Mixed allows for storing any type of data.
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Spreadsheet', spreadsheetSchema);