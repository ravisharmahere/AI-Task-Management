import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { TaskAssigner, TaskOptimizer } from '../ai-agents/agent.js';

const router = express.Router();
router.use(auth);

router.post('/optimize', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!description) {
      return res.status(400).json({ message: 'Task description is required for optimization' });
    }

    const optimizedText = await TaskOptimizer(title, description);
    res.json({ optimizedDescription: optimizedText });
  } catch (err) {
    console.error('Error in /api/ai/optimize:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to optimize task description' });
  }
});

router.post('/assign', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!description) {
      return res
        .status(400)
        .json({ message: 'Task description is required for assignment suggestion' });
    }

    const suggestion = await TaskAssigner(title, description);
    res.json({ assignee: suggestion });
  } catch (err) {
    console.error('Error in /api/ai/assign:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to get assignment suggestion' });
  }
});

export default router;
