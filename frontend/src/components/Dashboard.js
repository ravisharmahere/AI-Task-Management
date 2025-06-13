import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api'

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole') || 'user';
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tasks`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        });
        if (res.status === 401) {
          alert('Session expired or unauthorized. Please log in again.');
          window.location.href = '/login';
          return;
        }
        const data = await res.json();
        setTasks(data.tasks || []);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };
    fetchTasks();
  }, []);
  const handleAddTask = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to add task');
      } else {
        setTasks([...tasks, data.task]);
        setTitle('');
        setDescription('');
      }
    } catch (err) {
      console.error('Error adding task:', err);
      alert('Error adding task.');
    }
  };
  const handleDeleteTask = async taskId => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to delete task');
      } else {
        setTasks(tasks.filter(task => task._id !== taskId));
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Error deleting task.');
    }
  };
  const handleOptimize = async task => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({ title: task.title, description: task.description }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to optimize task');
      } else {
        alert('AI Suggestion (Improved Description):\n\n' + data.optimizedDescription);
      }
    } catch (err) {
      console.error('Error optimizing task:', err);
      alert('Error optimizing task.');
    }
  };
  const handleAssign = async task => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({ title: task.title, description: task.description }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to get assignment suggestion');
      } else {
        alert('AI Suggestion (Assignee):\n\n' + data.assignee);
      }
    } catch (err) {
      console.error('Error getting assignment suggestion:', err);
      alert('Error getting assignment suggestion.');
    }
  };
  const handleEditTask = async task => {
    const newDesc = window.prompt('Edit task description:', task.description);
    if (newDesc === null) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({ description: newDesc }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to update task');
      } else {
        setTasks(tasks.map(t => (t._id === task._id ? data.task : t)));
      }
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Error updating task.');
    }
  };
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };
  return (
    <div className="container mx-auto p-4">
      {}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div>
          <span className="mr-4">Welcome, {userName}!</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Logout
          </button>
        </div>
      </div>
      {}
      <div className="mb-6">
        {tasks.length === 0 ? (
          <p>No tasks found. Add a task to get started.</p>
        ) : (
          <div>
            {tasks.map(task => (
              <div key={task._id} className="bg-white p-4 rounded shadow mb-3">
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <p className="mb-2">{task.description}</p>
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
                  <button
                    onClick={() => handleAssign(task)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => handleEditTask(task)}
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                  >
                    Edit
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
      {}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Add New Task</h3>
        <form onSubmit={handleAddTask}>
          <div className="mb-2">
            <input
              type="text"
              placeholder="Task Title"
              className="w-full border border-gray-300 px-2 py-1 rounded"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-2">
            <textarea
              placeholder="Task Description"
              className="w-full border border-gray-300 px-2 py-1 rounded"
              value={description}
              onChange={e => setDescription(e.target.value)}
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
