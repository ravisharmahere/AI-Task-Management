import { TaskAssigner, TaskOptimizer } from '../ai-agents/agent.js';

export const optimizeTaskDescription = async taskData => {
  const { title, description } = taskData;

  if (!description) {
    throw new Error('Task description is required for optimization');
  }

  const optimizedText = await TaskOptimizer(title, description);
  return { optimizedDescription: optimizedText };
};

export const suggestTaskAssignment = async taskData => {
  const { title, description } = taskData;

  if (!description) {
    throw new Error('Task description is required for assignment suggestion');
  }

  const suggestion = await TaskAssigner(title, description);
  return { assignee: suggestion };
};
