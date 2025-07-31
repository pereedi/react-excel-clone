// backend/controllers/spreadsheetController.js
const Spreadsheet = require('../models/spreadsheetModel');

// @desc    Get all spreadsheets (metadata only)
// @route   GET /api/spreadsheets
exports.getSpreadsheets = async (req, res) => {
  try {
    // Find all spreadsheets but only return their id, fileName, and updatedAt
    const spreadsheets = await Spreadsheet.find().select('fileName updatedAt');
    res.status(200).json(spreadsheets);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get a single spreadsheet by ID
// @route   GET /api/spreadsheets/:id
exports.getSpreadsheetById = async (req, res) => {
  try {
    const spreadsheet = await Spreadsheet.findById(req.params.id);
    if (!spreadsheet) {
      return res.status(404).json({ message: 'Spreadsheet not found' });
    }
    res.status(200).json(spreadsheet);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new spreadsheet
// @route   POST /api/spreadsheets
exports.createSpreadsheet = async (req, res) => {
  try {
    const { fileName, data } = req.body;
    if (!fileName || !data) {
      return res.status(400).json({ message: 'fileName and data are required' });
    }
    const newSpreadsheet = await Spreadsheet.create({ fileName, data });
    res.status(201).json(newSpreadsheet);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update an existing spreadsheet
// @route   PUT /api/spreadsheets/:id
exports.updateSpreadsheet = async (req, res) => {
  try {
    const { fileName, data } = req.body;
    const spreadsheet = await Spreadsheet.findById(req.params.id);

    if (!spreadsheet) {
      return res.status(404).json({ message: 'Spreadsheet not found' });
    }

    // Update fields
    spreadsheet.fileName = fileName || spreadsheet.fileName;
    spreadsheet.data = data || spreadsheet.data;

    const updatedSpreadsheet = await spreadsheet.save();
    res.status(200).json(updatedSpreadsheet);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a spreadsheet
// @route   DELETE /api/spreadsheets/:id
exports.deleteSpreadsheet = async (req, res) => {
    try {
        const spreadsheet = await Spreadsheet.findById(req.params.id);
        if (!spreadsheet) {
            return res.status(404).json({ message: 'Spreadsheet not found' });
        }
        await spreadsheet.remove();
        res.status(200).json({ message: 'Spreadsheet removed successfully', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};