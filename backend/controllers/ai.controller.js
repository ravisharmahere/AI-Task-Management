import * as aiService from '../services/ai.service.js';

export const optimizeTask = async (req, res) => {
  try {
    const result = await aiService.optimizeTaskDescription(req.body);
    res.json(result);
  } catch (err) {
    console.error('Error in optimizeTask:', err);
    if (err.message.includes('required')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to optimize task description' });
  }
};

export const suggestAssignment = async (req, res) => {
  try {
    const result = await aiService.suggestTaskAssignment(req.body);
    res.json(result);
  } catch (err) {
    console.error('Error in suggestAssignment:', err);
    if (err.message.includes('required')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to get assignment suggestion' });
  }
};
