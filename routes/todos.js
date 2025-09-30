const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get all todos for user
router.get('/', async (req, res) => {
  try {
    let todo = await Todo.findOne({ userId: req.userId });
    
    if (!todo) {
      // Create default todo structure for new users
      todo = new Todo({
        userId: req.userId,
        lists: [{
          title: 'To-Do List',
          tasks: []
        }],
        settings: {
          theme: 'light',
          colorTheme: 'default',
          isCanvasView: false
        }
      });
      await todo.save();
    }

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching todos' 
    });
  }
});

// Save/Update all todos
router.post('/', async (req, res) => {
  try {
    const { lists, settings } = req.body;

    let todo = await Todo.findOne({ userId: req.userId });
    
    if (!todo) {
      todo = new Todo({
        userId: req.userId,
        lists: lists || [],
        settings: settings || {}
      });
    } else {
      if (lists) todo.lists = lists;
      if (settings) todo.settings = { ...todo.settings, ...settings };
    }

    await todo.save();

    res.json({
      success: true,
      message: 'Todos saved successfully',
      data: todo
    });
  } catch (error) {
    console.error('Save todos error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving todos' 
    });
  }
});

// Update settings only
router.put('/settings', async (req, res) => {
  try {
    const { theme, colorTheme, isCanvasView } = req.body;

    let todo = await Todo.findOne({ userId: req.userId });
    
    if (!todo) {
      todo = new Todo({
        userId: req.userId,
        lists: [],
        settings: {}
      });
    }

    if (theme !== undefined) todo.settings.theme = theme;
    if (colorTheme !== undefined) todo.settings.colorTheme = colorTheme;
    if (isCanvasView !== undefined) todo.settings.isCanvasView = isCanvasView;

    await todo.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: todo.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating settings' 
    });
  }
});

// Delete all todos (for logout/reset)
router.delete('/', async (req, res) => {
  try {
    await Todo.deleteOne({ userId: req.userId });
    
    res.json({
      success: true,
      message: 'All todos deleted successfully'
    });
  } catch (error) {
    console.error('Delete todos error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting todos' 
    });
  }
});

module.exports = router;

