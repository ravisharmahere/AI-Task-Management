import express from 'express';
import TaskModel from '../database/TaskModel.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await TaskModel.find()
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email');
    } else {
      tasks = await TaskModel.find({ $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }] })
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email');
    }
    res.json({ tasks });
  } catch (err) {
    console.error('Error in GET /tasks:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    const task = new TaskModel({
      title,
      description,
      createdBy: req.user.id,
    });
    await task.save();
    await task.populate('createdBy', 'name email');
    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    console.error('Error in POST /tasks:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const task = await TaskModel.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You cannot edit this task' });
    }
    if (title) task.title = title;
    if (description) task.description = description;
    await task.save();
    await task.populate('createdBy', 'name email');
    await task.populate('assignedTo', 'name email');
    res.json({ message: 'Task updated', task });
  } catch (err) {
    console.error('Error in PUT /tasks:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You cannot delete this task' });
    }
    await task.remove();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Error in DELETE /tasks:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
