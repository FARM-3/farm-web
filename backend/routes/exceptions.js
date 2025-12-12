const express = require('express');
const dataStore = require('../models/DataStore');

const router = express.Router();

// GET /api/exceptions/ - List all exceptions with optional filtering
router.get('/', (req, res) => {
  try {
    const { search, status, severity, reported_by, farm_block, page = 1, limit = 50 } = req.query;
    let exceptions = dataStore.getAll('exceptions');

    // Apply filters
    if (search) {
      exceptions = dataStore.search('exceptions', search, ['title', 'description', 'reported_by']);
    }

    if (status && status !== 'all') {
      exceptions = exceptions.filter(exception => exception.status === status);
    }

    if (severity && severity !== 'all') {
      exceptions = exceptions.filter(exception => exception.severity === severity);
    }

    if (reported_by) {
      exceptions = exceptions.filter(exception => 
        exception.reported_by.toLowerCase().includes(reported_by.toLowerCase())
      );
    }

    if (farm_block) {
      exceptions = exceptions.filter(exception => exception.farm_block === farm_block);
    }

    // Sort by created_at descending (newest first)
    exceptions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedExceptions = exceptions.slice(startIndex, endIndex);

    res.json({
      count: exceptions.length,
      results: paginatedExceptions,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(exceptions.length / limit)
    });

  } catch (error) {
    console.error('Error fetching exceptions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch exceptions'
    });
  }
});

// GET /api/exceptions/:id - Get single exception
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const exception = dataStore.getById('exceptions', id);

    if (!exception) {
      return res.status(404).json({
        error: 'Exception not found',
        message: `Exception with ID ${id} does not exist`
      });
    }

    res.json(exception);

  } catch (error) {
    console.error('Error fetching exception:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch exception'
    });
  }
});

// POST /api/exceptions/ - Create new exception
router.post('/', (req, res) => {
  try {
    const {
      title,
      description = '',
      severity = 'medium',
      status = 'open',
      weather_conditions = [],
      evidence_files = [],
      reported_by,
      location = '',
      farm_block = null
    } = req.body;

    // Validation
    if (!title || !reported_by) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title and reported_by are required fields'
      });
    }

    if (!['low', 'medium', 'high'].includes(severity)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Severity must be low, medium, or high'
      });
    }

    if (!['open', 'investigating', 'resolved'].includes(status)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Status must be open, investigating, or resolved'
      });
    }

    // Validate weather conditions
    const validWeatherConditions = ['sunny', 'cloudy', 'rainy', 'dry', 'windy', 'hot', 'cold'];
    const filteredWeatherConditions = weather_conditions.filter(condition => 
      validWeatherConditions.includes(condition)
    );

    const newException = dataStore.create('exceptions', {
      title,
      description,
      severity,
      status,
      weather_conditions: filteredWeatherConditions,
      evidence_files,
      reported_by,
      location,
      farm_block
    });

    res.status(201).json(newException);

  } catch (error) {
    console.error('Error creating exception:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create exception'
    });
  }
});

// PUT /api/exceptions/:id - Update entire exception
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existingException = dataStore.getById('exceptions', id);

    if (!existingException) {
      return res.status(404).json({
        error: 'Exception not found',
        message: `Exception with ID ${id} does not exist`
      });
    }

    const {
      title,
      description,
      severity,
      status,
      weather_conditions,
      evidence_files,
      reported_by,
      location,
      farm_block
    } = req.body;

    // Validation
    if (severity && !['low', 'medium', 'high'].includes(severity)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Severity must be low, medium, or high'
      });
    }

    if (status && !['open', 'investigating', 'resolved'].includes(status)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Status must be open, investigating, or resolved'
      });
    }

    // Validate weather conditions
    let filteredWeatherConditions = weather_conditions;
    if (weather_conditions) {
      const validWeatherConditions = ['sunny', 'cloudy', 'rainy', 'dry', 'windy', 'hot', 'cold'];
      filteredWeatherConditions = weather_conditions.filter(condition => 
        validWeatherConditions.includes(condition)
      );
    }

    const updatedException = dataStore.update('exceptions', id, {
      title,
      description,
      severity,
      status,
      weather_conditions: filteredWeatherConditions,
      evidence_files,
      reported_by,
      location,
      farm_block
    });

    res.json(updatedException);

  } catch (error) {
    console.error('Error updating exception:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update exception'
    });
  }
});

// PATCH /api/exceptions/:id - Partial update exception
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existingException = dataStore.getById('exceptions', id);

    if (!existingException) {
      return res.status(404).json({
        error: 'Exception not found',
        message: `Exception with ID ${id} does not exist`
      });
    }

    const { severity, status, weather_conditions } = req.body;

    // Validation for specific fields
    if (severity && !['low', 'medium', 'high'].includes(severity)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Severity must be low, medium, or high'
      });
    }

    if (status && !['open', 'investigating', 'resolved'].includes(status)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Status must be open, investigating, or resolved'
      });
    }

    // Validate weather conditions if provided
    let filteredWeatherConditions = weather_conditions;
    if (weather_conditions) {
      const validWeatherConditions = ['sunny', 'cloudy', 'rainy', 'dry', 'windy', 'hot', 'cold'];
      filteredWeatherConditions = weather_conditions.filter(condition => 
        validWeatherConditions.includes(condition)
      );
    }

    const updateData = { ...req.body };
    if (filteredWeatherConditions) {
      updateData.weather_conditions = filteredWeatherConditions;
    }

    const updatedException = dataStore.update('exceptions', id, updateData);

    res.json(updatedException);

  } catch (error) {
    console.error('Error partially updating exception:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update exception'
    });
  }
});

// DELETE /api/exceptions/:id - Delete exception
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existingException = dataStore.getById('exceptions', id);

    if (!existingException) {
      return res.status(404).json({
        error: 'Exception not found',
        message: `Exception with ID ${id} does not exist`
      });
    }

    const deleted = dataStore.delete('exceptions', id);

    if (deleted) {
      res.status(204).send();
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete exception'
      });
    }

  } catch (error) {
    console.error('Error deleting exception:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete exception'
    });
  }
});

module.exports = router;