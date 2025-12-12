const express = require('express');
const dataStore = require('../models/DataStore');

const router = express.Router();

// GET /api/tasks/ - List all tasks with optional filtering
router.get('/', (req, res) => {
  try {
    const { search, status, assigned_to, farm_block, page = 1, limit = 50 } = req.query;
    let tasks = dataStore.getAll('tasks');

    // Apply filters
    if (search) {
      tasks = dataStore.search('tasks', search, ['title', 'description', 'assigned_to']);
    }

    if (status && status !== 'all') {
      tasks = tasks.filter(task => task.status === status);
    }

    if (assigned_to) {
      tasks = tasks.filter(task => 
        task.assigned_to.toLowerCase().includes(assigned_to.toLowerCase())
      );
    }

    if (farm_block) {
      tasks = tasks.filter(task => task.farm_block === farm_block);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTasks = tasks.slice(startIndex, endIndex);

    res.json({
      count: tasks.length,
      results: paginatedTasks,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(tasks.length / limit)
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch tasks'
    });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const task = dataStore.getById('tasks', id);

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: `Task with ID ${id} does not exist`
      });
    }

    res.json(task);

  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch task'
    });
  }
});

// POST /api/tasks/ - Create new task
router.post('/', (req, res) => {
  try {
    const {
      title,
      description = '',
      assigned_to,
      priority = 'medium',
      status = 'pending',
      due_date,
      farm_block = null
    } = req.body;

    // Validation
    if (!title || !assigned_to) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title and assigned_to are required fields'
      });
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Priority must be low, medium, or high'
      });
    }

    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Status must be pending, in_progress, or completed'
      });
    }

    const newTask = dataStore.create('tasks', {
      title,
      description,
      assigned_to,
      priority,
      status,
      due_date,
      farm_block
    });

    res.status(201).json(newTask);

  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create task'
    });
  }
});

// PUT /api/tasks/:id - Update entire task
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existingTask = dataStore.getById('tasks', id);

    if (!existingTask) {
      return res.status(404).json({
        error: 'Task not found',
        message: `Task with ID ${id} does not exist`
      });
    }

    const {
      title,
      description,
      assigned_to,
      priority,
      status,
      due_date,
      farm_block
    } = req.body;

    // Validation
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Priority must be low, medium, or high'
      });
    }

    if (status && !['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Status must be pending, in_progress, or completed'
      });
    }

    const updatedTask = dataStore.update('tasks', id, {
      title,
      description,
      assigned_to,
      priority,
      status,
      due_date,
      farm_block
    });

    res.json(updatedTask);

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update task'
    });
  }
});

// PATCH /api/tasks/:id - Partial update task
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existingTask = dataStore.getById('tasks', id);

    if (!existingTask) {
      return res.status(404).json({
        error: 'Task not found',
        message: `Task with ID ${id} does not exist`
      });
    }

    const { priority, status } = req.body;

    // Validation for specific fields
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Priority must be low, medium, or high'
      });
    }

    if (status && !['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Status must be pending, in_progress, or completed'
      });
    }

    const updatedTask = dataStore.update('tasks', id, req.body);

    res.json(updatedTask);

  } catch (error) {
    console.error('Error partially updating task:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update task'
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existingTask = dataStore.getById('tasks', id);

    if (!existingTask) {
      return res.status(404).json({
        error: 'Task not found',
        message: `Task with ID ${id} does not exist`
      });
    }

    const deleted = dataStore.delete('tasks', id);

    if (deleted) {
      res.status(204).send();
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete task'
      });
    }

  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete task'
    });
  }
});

module.exports = router;