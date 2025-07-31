// backend/routes/spreadsheetRoutes.js
const express = require('express');
const router = express.Router();
const {
  getSpreadsheets,
  getSpreadsheetById,
  createSpreadsheet,
  updateSpreadsheet,
  deleteSpreadsheet
} = require('../controllers/spreadsheetController');

// Route for getting all and creating one
router.route('/')
  .get(getSpreadsheets)
  .post(createSpreadsheet);

// Route for getting, updating, and deleting a single spreadsheet
router.route('/:id')
  .get(getSpreadsheetById)
  .put(updateSpreadsheet)
  .delete(deleteSpreadsheet);

module.exports = router;