import * as TaskService from '../services/task.service.js';

export const getTasks = async (req, res) => {
  try {
    const tasks = await TaskService.getAllTasks(req.user.id, req.user.role);
    res.json({ tasks });
  } catch (err) {
    console.error('Error in getTasks:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const task = await TaskService.createTask({ title, description }, req.user.id);
    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    console.error('Error in createTask:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const task = await TaskService.updateTask(
      req.params.id,
      { title, description },
      req.user.id,
      req.user.role
    );
    res.json({ message: 'Task updated', task });
  } catch (err) {
    console.error('Error in updateTask:', err);
    if (err.message === 'Task not found') {
      return res.status(404).json({ message: err.message });
    }
    if (err.message.includes('Forbidden')) {
      return res.status(403).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const result = await TaskService.deleteTask(req.params.id, req.user.id, req.user.role);
    res.json(result);
  } catch (err) {
    console.error('Error in deleteTask:', err);
    if (err.message === 'Task not found') {
      return res.status(404).json({ message: err.message });
    }
    if (err.message.includes('Forbidden')) {
      return res.status(403).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
