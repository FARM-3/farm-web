const express = require('express');
const dataStore = require('../models/DataStore');

const router = express.Router();

// GET /api/farm-blocks/ - List all farm blocks with optional filtering
router.get('/', (req, res) => {
  try {
    const { search, status, crop, page = 1, limit = 50 } = req.query;
    let farmBlocks = dataStore.getAll('farmBlocks');

    // Apply filters
    if (search) {
      farmBlocks = dataStore.search('farmBlocks', search, ['name', 'crop']);
    }

    if (status && status !== 'all') {
      farmBlocks = farmBlocks.filter(block => block.status === status);
    }

    if (crop && crop !== 'all') {
      farmBlocks = farmBlocks.filter(block => block.crop === crop);
    }

    // Sort by name
    farmBlocks.sort((a, b) => a.name.localeCompare(b.name));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBlocks = farmBlocks.slice(startIndex, endIndex);

    res.json({
      count: farmBlocks.length,
      results: paginatedBlocks,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(farmBlocks.length / limit)
    });

  } catch (error) {
    console.error('Error fetching farm blocks:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch farm blocks'
    });
  }
});

// GET /api/farm-blocks/:id - Get single farm block
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const farmBlock = dataStore.getById('farmBlocks', id);

    if (!farmBlock) {
      return res.status(404).json({
        error: 'Farm block not found',
        message: `Farm block with ID ${id} does not exist`
      });
    }

    res.json(farmBlock);

  } catch (error) {
    console.error('Error fetching farm block:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch farm block'
    });
  }
});

// POST /api/farm-blocks/ - Create new farm block
router.post('/', (req, res) => {
  try {
    const {
      id,
      name,
      area,
      crop = 'Coffee',
      condition_score = 100,
      location = { lat: 0, lng: 0 },
      status = 'active'
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name is required'
      });
    }

    if (!area || isNaN(area) || area <= 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Area must be a positive number'
      });
    }

    if (condition_score < 0 || condition_score > 100) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Condition score must be between 0 and 100'
      });
    }

    if (!['active', 'inactive', 'maintenance'].includes(status)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Status must be active, inactive, or maintenance'
      });
    }

    // Check for duplicate ID if provided
    if (id && dataStore.getById('farmBlocks', id)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Farm block ID already exists'
      });
    }

    const newFarmBlock = dataStore.create('farmBlocks', {
      id: id || undefined, // Let DataStore generate ID if not provided
      name,
      area,
      crop,
      condition_score,
      open_tasks: 0, // Default to 0 for new blocks
      last_inspection: new Date().toISOString().split('T')[0], // Today's date
      location,
      status
    });

    res.status(201).json(newFarmBlock);

  } catch (error) {
    console.error('Error creating farm block:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create farm block'
    });
  }
});

// PUT /api/farm-blocks/:id - Update entire farm block
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existingBlock = dataStore.getById('farmBlocks', id);

    if (!existingBlock) {
      return res.status(404).json({
        error: 'Farm block not found',
        message: `Farm block with ID ${id} does not exist`
      });
    }

    const {
      name,
      area,
      crop,
      condition_score,
      open_tasks,
      last_inspection,
      location,
      status
    } = req.body;

    // Validation
    if (area && (isNaN(area) || area <= 0)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Area must be a positive number'
      });
    }

    if (condition_score !== undefined && (condition_score < 0 || condition_score > 100)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Condition score must be between 0 and 100'
      });
    }

    if (open_tasks !== undefined && (isNaN(open_tasks) || open_tasks < 0)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Open tasks must be a non-negative number'
      });
    }

    if (status && !['active', 'inactive', 'maintenance'].includes(status)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Status must be active, inactive, or maintenance'
      });
    }

    const updatedBlock = dataStore.update('farmBlocks', id, {
      name,
      area,
      crop,
      condition_score,
      open_tasks,
      last_inspection,
      location,
      status
    });

    res.json(updatedBlock);

  } catch (error) {
    console.error('Error updating farm block:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update farm block'
    });
  }
});

// PATCH /api/farm-blocks/:id - Partial update farm block
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existingBlock = dataStore.getById('farmBlocks', id);

    if (!existingBlock) {
      return res.status(404).json({
        error: 'Farm block not found',
        message: `Farm block with ID ${id} does not exist`
      });
    }

    const { condition_score, open_tasks, status } = req.body;

    // Validation for specific fields
    if (condition_score !== undefined && (condition_score < 0 || condition_score > 100)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Condition score must be between 0 and 100'
      });
    }

    if (open_tasks !== undefined && (isNaN(open_tasks) || open_tasks < 0)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Open tasks must be a non-negative number'
      });
    }

    if (status && !['active', 'inactive', 'maintenance'].includes(status)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Status must be active, inactive, or maintenance'
      });
    }

    const updatedBlock = dataStore.update('farmBlocks', id, req.body);

    res.json(updatedBlock);

  } catch (error) {
    console.error('Error partially updating farm block:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update farm block'
    });
  }
});

// DELETE /api/farm-blocks/:id - Delete farm block
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existingBlock = dataStore.getById('farmBlocks', id);

    if (!existingBlock) {
      return res.status(404).json({
        error: 'Farm block not found',
        message: `Farm block with ID ${id} does not exist`
      });
    }

    const deleted = dataStore.delete('farmBlocks', id);

    if (deleted) {
      res.status(204).send();
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete farm block'
      });
    }

  } catch (error) {
    console.error('Error deleting farm block:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete farm block'
    });
  }
});

module.exports = router;