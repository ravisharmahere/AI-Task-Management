import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [optimizedContent, setOptimizedContent] = useState({});
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/api/tasks');
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/tasks', formData);
      setTasks([...tasks, data.task]);
      setFormData({ title: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task');
    }
  };

  const handleDeleteTask = async taskId => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleOptimize = async task => {
    try {
      const { data } = await api.post('/api/ai/optimize', {
        title: task.title,
        description: task.description,
      });
      setOptimizedContent(prev => ({
        ...prev,
        [task._id]: {
          title: data.optimizedTitle,
          description: data.optimizedDescription,
        },
      }));
      alert(
        'AI Suggestion:\n\nTitle: ' +
          data.optimizedTitle +
          '\n\nDescription: ' +
          data.optimizedDescription
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to optimize task');
    }
  };

  const handleUseOptimization = async task => {
    const optimized = optimizedContent[task._id];
    if (!optimized) return;

    try {
      const { data } = await api.put(`/api/tasks/${task._id}`, {
        title: optimized.title,
        description: optimized.description,
      });
      setTasks(tasks.map(t => (t._id === task._id ? data.task : t)));
      setOptimizedContent(prev => {
        const newState = { ...prev };
        delete newState[task._id];
        return newState;
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply optimization');
    }
  };

  const handleAssign = async task => {
    try {
      const { data } = await api.post('/api/ai/assign', {
        title: task.title,
        description: task.description,
      });
      alert(
        'AI Suggestion (Assignee):\n\n' +
          'Name: ' +
          data.assignee +
          '\n' +
          'Email: ' +
          data.assigneeEmail +
          '\n' +
          'Current Task Load: ' +
          data.currentTaskLoad +
          ' tasks\n' +
          'Workload Complexity: ' +
          data.complexityScore +
          '/10\n' +
          'Overall Workload Score: ' +
          data.workloadScore.toFixed(1) +
          '\n' +
          (data.note ? '\nNote: ' + data.note : '')
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get assignment suggestion');
    }
  };

  const handleSummary = async () => {
    try {
      const { data } = await api.post('/api/ai/summary', { tasks });
      alert('Daily Activity Summary:\n\n' + data.summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate summary');
    }
  };

  const handleEditTitle = async task => {
    const newTitle = window.prompt('Edit task title:', task.title);
    if (newTitle === null || !newTitle.trim()) return;

    try {
      const { data } = await api.put(`/api/tasks/${task._id}`, {
        title: newTitle,
        description: task.description,
      });
      setTasks(tasks.map(t => (t._id === task._id ? data.task : t)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task title');
    }
  };

  const handleEditDescription = async task => {
    const newDesc = window.prompt('Edit task description:', task.description);
    if (newDesc === null || !newDesc.trim()) return;

    try {
      const { data } = await api.put(`/api/tasks/${task._id}`, {
        title: task.title,
        description: newDesc,
      });
      setTasks(tasks.map(t => (t._id === task._id ? data.task : t)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task description');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="container mx-auto p-4">
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div>
          <button
            onClick={handleSummary}
            className="mr-4 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Get Summary
          </button>
          <span className="mr-4">Welcome, {user.name}!</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mb-6">
        {tasks.length === 0 ? (
          <p>No tasks found. Add a task to get started.</p>
        ) : (
          <div>
            {tasks.map(task => (
              <div key={task._id} className="bg-white p-4 rounded shadow mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <button
                    onClick={() => handleEditTitle(task)}
                    className="text-gray-500 hover:text-blue-600"
                    title="Edit title"
                  >
                    ✏️
                  </button>
                </div>
                <div className="flex items-start gap-2 mb-2">
                  <p className="flex-grow">{task.description}</p>
                  <button
                    onClick={() => handleEditDescription(task)}
                    className="text-gray-500 hover:text-blue-600"
                    title="Edit description"
                  >
                    ✏️
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Created by: {task.createdBy ? task.createdBy.name : 'Unknown'}
                  {task.createdBy && task.createdBy.email ? ' (' + task.createdBy.email + ')' : ''}
                  {task.assignedTo ? ' | Assigned to: ' + task.assignedTo.name : ''}
                </p>
                <div className="space-x-2">
                  <button
                    onClick={() => handleOptimize(task)}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                  >
                    Optimize
                  </button>
                  {optimizedContent[task._id] && (
                    <button
                      onClick={() => handleUseOptimization(task)}
                      className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                    >
                      Use Optimization
                    </button>
                  )}
                  <button
                    onClick={() => handleAssign(task)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Add New Task</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <input
              type="text"
              name="title"
              placeholder="Task Title"
              className="w-full border border-gray-300 px-2 py-1 rounded"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-2">
            <textarea
              name="description"
              placeholder="Task Description"
              className="w-full border border-gray-300 px-2 py-1 rounded"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
