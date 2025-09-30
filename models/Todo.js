const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  checked: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: String,
    default: null
  }
});

const todoListSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'To-Do List'
  },
  tasks: [taskSchema],
  position: {
    left: String,
    top: String
  }
});

const todoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lists: [todoListSchema],
  settings: {
    theme: {
      type: String,
      default: 'light'
    },
    colorTheme: {
      type: String,
      default: 'default'
    },
    isCanvasView: {
      type: Boolean,
      default: false
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

todoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Todo', todoSchema);

