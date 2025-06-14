import TaskModel from '../database/task.model.js';

export const getAllTasks = async (userId, userRole) => {
  if (userRole === 'admin') {
    return await TaskModel.find()
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
  }
  return await TaskModel.find({
    $or: [{ createdBy: userId }, { assignedTo: userId }],
  })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email');
};

export const createTask = async (taskData, userId) => {
  const task = new TaskModel({
    ...taskData,
    createdBy: userId,
  });
  await task.save();
  await task.populate('createdBy', 'name email');
  return task;
};

export const updateTask = async (taskId, taskData, userId, userRole) => {
  const task = await TaskModel.findById(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  if (userRole !== 'admin' && task.createdBy.toString() !== userId) {
    throw new Error('Forbidden: You cannot edit this task');
  }

  Object.assign(task, taskData);
  await task.save();
  await task.populate('createdBy', 'name email');
  await task.populate('assignedTo', 'name email');
  return task;
};

export const deleteTask = async (taskId, userId, userRole) => {
  const task = await TaskModel.findById(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  if (userRole !== 'admin' && task.createdBy.toString() !== userId) {
    throw new Error('Forbidden: You cannot delete this task');
  }

  await task.deleteOne();
  return { message: 'Task deleted' };
};
