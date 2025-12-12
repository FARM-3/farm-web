const express = require('express');
const dataStore = require('../models/DataStore');

const router = express.Router();

// GET /api/sop-templates/ - List all SOP templates with optional filtering
router.get('/', (req, res) => {
  try {
    const { search, category, priority, page = 1, limit = 50 } = req.query;
    let sopTemplates = dataStore.getAll('sopTemplates');

    // Apply filters
    if (search) {
      sopTemplates = dataStore.search('sopTemplates', search, ['name', 'description', 'category']);
    }

    if (category && category !== 'all') {
      sopTemplates = sopTemplates.filter(template => template.category === category);
    }

    if (priority && priority !== 'all') {
      sopTemplates = sopTemplates.filter(template => template.priority === priority);
    }

    // Sort by priority (high, medium, low) and then by name
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    sopTemplates.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.name.localeCompare(b.name);
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTemplates = sopTemplates.slice(startIndex, endIndex);

    res.json({
      count: sopTemplates.length,
      results: paginatedTemplates,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(sopTemplates.length / limit)
    });

  } catch (error) {
    console.error('Error fetching SOP templates:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch SOP templates'
    });
  }
});

// GET /api/sop-templates/:id - Get single SOP template
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const sopTemplate = dataStore.getById('sopTemplates', id);

    if (!sopTemplate) {
      return res.status(404).json({
        error: 'SOP template not found',
        message: `SOP template with ID ${id} does not exist`
      });
    }

    res.json(sopTemplate);

  } catch (error) {
    console.error('Error fetching SOP template:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch SOP template'
    });
  }
});

// POST /api/sop-templates/ - Create new SOP template
router.post('/', (req, res) => {
  try {
    const {
      name,
      category = 'General',
      priority = 'medium',
      duration = '1 hour',
      description = '',
      steps = []
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name is required'
      });
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Priority must be low, medium, or high'
      });
    }

    // Validate category
    const validCategories = ['Harvest', 'Maintenance', 'Nutrition', 'Pest Control', 'Quality', 'General'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    // Validate steps is an array
    if (!Array.isArray(steps)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Steps must be an array'
      });
    }

    const newSOPTemplate = dataStore.create('sopTemplates', {
      name,
      category,
      priority,
      duration,
      description,
      steps
    });

    res.status(201).json(newSOPTemplate);

  } catch (error) {
    console.error('Error creating SOP template:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create SOP template'
    });
  }
});

// PUT /api/sop-templates/:id - Update entire SOP template
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existingTemplate = dataStore.getById('sopTemplates', id);

    if (!existingTemplate) {
      return res.status(404).json({
        error: 'SOP template not found',
        message: `SOP template with ID ${id} does not exist`
      });
    }

    const {
      name,
      category,
      priority,
      duration,
      description,
      steps
    } = req.body;

    // Validation
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Priority must be low, medium, or high'
      });
    }

    // Validate category
    const validCategories = ['Harvest', 'Maintenance', 'Nutrition', 'Pest Control', 'Quality', 'General'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    // Validate steps is an array if provided
    if (steps && !Array.isArray(steps)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Steps must be an array'
      });
    }

    const updatedTemplate = dataStore.update('sopTemplates', id, {
      name,
      category,
      priority,
      duration,
      description,
      steps
    });

    res.json(updatedTemplate);

  } catch (error) {
    console.error('Error updating SOP template:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update SOP template'
    });
  }
});

// PATCH /api/sop-templates/:id - Partial update SOP template
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existingTemplate = dataStore.getById('sopTemplates', id);

    if (!existingTemplate) {
      return res.status(404).json({
        error: 'SOP template not found',
        message: `SOP template with ID ${id} does not exist`
      });
    }

    const { priority, steps } = req.body;

    // Validation for specific fields
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Priority must be low, medium, or high'
      });
    }

    // Validate steps is an array if provided
    if (steps && !Array.isArray(steps)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Steps must be an array'
      });
    }

    const updatedTemplate = dataStore.update('sopTemplates', id, req.body);

    res.json(updatedTemplate);

  } catch (error) {
    console.error('Error partially updating SOP template:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update SOP template'
    });
  }
});

// DELETE /api/sop-templates/:id - Delete SOP template
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existingTemplate = dataStore.getById('sopTemplates', id);

    if (!existingTemplate) {
      return res.status(404).json({
        error: 'SOP template not found',
        message: `SOP template with ID ${id} does not exist`
      });
    }

    const deleted = dataStore.delete('sopTemplates', id);

    if (deleted) {
      res.status(204).send();
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete SOP template'
      });
    }

  } catch (error) {
    console.error('Error deleting SOP template:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete SOP template'
    });
  }
});

module.exports = router;