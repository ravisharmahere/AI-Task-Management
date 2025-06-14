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
  const [employees, setEmployees] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [selectedTaskForOptimization, setSelectedTaskForOptimization] = useState(null);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [newDeadline, setNewDeadline] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [isOptimizing, setIsOptimizing] = useState({});
  const [isAssigning, setIsAssigning] = useState({});
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  useEffect(() => {
    fetchTasks();
    if (isAdmin) {
      fetchEmployees();
    }
  }, []);
  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/api/tasks');
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    }
  };
  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/api/tasks/employees');
      setEmployees(data.employees || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
    }
  };
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!isAdmin) {
      setError('Only administrators can create tasks');
      return;
    }
    try {
      const { data } = await api.post('/api/tasks', formData);
      setTasks([...tasks, data.task]);
      setFormData({ title: '', description: '' });
      document.getElementById('createTaskForm').classList.add('hidden');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task');
    }
  };
  const handleDeleteTask = async taskId => {
    if (!isAdmin) {
      setError('Only administrators can delete tasks');
      return;
    }
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
    if (!isAdmin) {
      setError('Only administrators can optimize tasks');
      return;
    }
    setIsOptimizing(prev => ({ ...prev, [task._id]: true }));
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
      setSelectedTaskForOptimization(task);
      setShowOptimizeModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to optimize task');
    } finally {
      setIsOptimizing(prev => ({ ...prev, [task._id]: false }));
    }
  };
  const handleUseOptimization = async task => {
    if (!isAdmin) {
      setError('Only administrators can apply optimizations');
      return;
    }
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
      setShowOptimizeModal(false);
      setSelectedTaskForOptimization(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply optimization');
    }
  };
  const handleManualAssign = async task => {
    if (!isAdmin) {
      setError('Only administrators can assign tasks');
      return;
    }
    const employeeList = employees.map(emp => `${emp.name} (${emp.email})`).join('\n');
    const selectedEmployee = window.prompt(
      `Select an employee to assign this task to:\n\n${employeeList}\n\nEnter the employee's email:`
    );
    if (!selectedEmployee) return;
    const employee = employees.find(emp => emp.email === selectedEmployee);
    if (!employee) {
      setError('Invalid employee selected');
      return;
    }
    try {
      const assignResponse = await api.post(`/api/tasks/${task._id}/assign`, {
        assigneeId: employee._id,
      });
      setTasks(tasks.map(t => (t._id === task._id ? assignResponse.data.task : t)));
      alert('Task assigned successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign task');
    }
  };
  const handleAssign = async task => {
    if (!isAdmin) {
      setError('Only administrators can assign tasks');
      return;
    }
    setIsAssigning(prev => ({ ...prev, [task._id]: true }));
    try {
      const { data } = await api.post('/api/ai/assign', {
        title: task.title,
        description: task.description,
      });
      setAiSuggestion(data);
      setSelectedTask(task);
      setShowAssignModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign task');
    } finally {
      setIsAssigning(prev => ({ ...prev, [task._id]: false }));
    }
  };
  const handleAssignToEmployee = async employeeId => {
    try {
      const assignResponse = await api.post(`/api/tasks/${selectedTask._id}/assign`, {
        assigneeId: employeeId,
      });
      setTasks(tasks.map(t => (t._id === selectedTask._id ? assignResponse.data.task : t)));
      setShowAssignModal(false);
      setSelectedTask(null);
      setAiSuggestion(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign task');
    }
  };
  const handleSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const { data } = await api.post('/api/ai/summary', { tasks });
      setSummaryContent(data.summary);
      setShowSummaryModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate summary');
    } finally {
      setIsGeneratingSummary(false);
    }
  };
  const handleEditTitle = async task => {
    if (!isAdmin) {
      setError('Only administrators can edit tasks');
      return;
    }
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
    if (!isAdmin) {
      setError('Only administrators can edit tasks');
      return;
    }
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
  const handleEditDeadline = async task => {
    if (!isAdmin) {
      setError('Only administrators can edit tasks');
      return;
    }
    setSelectedTaskForEdit(task);
    setNewDeadline(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '');
    setShowDeadlineModal(true);
  };
  const handleEditStatus = async task => {
    setSelectedTaskForEdit(task);
    setNewStatus(task.status);
    setShowStatusModal(true);
  };
  const handleSaveDeadline = async () => {
    try {
      const { data } = await api.put(`/api/tasks/${selectedTaskForEdit._id}/deadline`, {
        deadline: newDeadline,
      });
      setTasks(tasks.map(t => (t._id === selectedTaskForEdit._id ? data.task : t)));
      setShowDeadlineModal(false);
      setSelectedTaskForEdit(null);
      setNewDeadline('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update deadline');
    }
  };
  const handleSaveStatus = async () => {
    try {
      const { data } = await api.put(`/api/tasks/${selectedTaskForEdit._id}/status`, {
        status: newStatus,
      });
      setTasks(tasks.map(t => (t._id === selectedTaskForEdit._id ? data.task : t)));
      setShowStatusModal(false);
      setSelectedTaskForEdit(null);
      setNewStatus('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };
  const formatDate = dateString => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  const getStatusColor = status => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  const handleSuggestions = async () => {
    setIsGeneratingSuggestions(true);
    try {
      const { data } = await api.post('/api/ai/suggest', {
        tasks,
        employeeId: isAdmin ? null : user.id,
      });
      setSuggestions(data.suggestions);
      setShowSuggestionsModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate suggestions');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };
  return (
    <div className="container mx-auto p-4">
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      {}
      {showOptimizeModal && selectedTaskForOptimization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Task Optimization</h3>
              <button
                onClick={() => {
                  setShowOptimizeModal(false);
                  setSelectedTaskForOptimization(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-6">
              <h4 className="font-medium mb-2">Current Task</h4>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p>
                  <strong>Title:</strong> {selectedTaskForOptimization.title}
                </p>
                <p>
                  <strong>Description:</strong> {selectedTaskForOptimization.description}
                </p>
              </div>
            </div>
            <div className="mb-6">
              <h4 className="font-medium mb-2">AI Suggested Optimization</h4>
              {optimizedContent[selectedTaskForOptimization._id] && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p>
                    <strong>Optimized Title:</strong>{' '}
                    {optimizedContent[selectedTaskForOptimization._id].title}
                  </p>
                  <p>
                    <strong>Optimized Description:</strong>{' '}
                    {optimizedContent[selectedTaskForOptimization._id].description}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleUseOptimization(selectedTaskForOptimization)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Apply Optimization
                    </button>
                    <button
                      onClick={() => {
                        setShowOptimizeModal(false);
                        setSelectedTaskForOptimization(null);
                      }}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Keep Original
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {}
      {showAssignModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Assign Task</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedTask(null);
                  setAiSuggestion(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-6">
              <h4 className="font-medium mb-2">AI Suggestion</h4>
              {aiSuggestion && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p>
                    <strong>Suggested Employee:</strong> {aiSuggestion.assignee}
                  </p>
                  <p>
                    <strong>Email:</strong> {aiSuggestion.assigneeEmail}
                  </p>
                  <p>
                    <strong>Current Task Load:</strong> {aiSuggestion.currentTaskLoad} tasks
                  </p>
                  <p>
                    <strong>Workload Complexity:</strong> {aiSuggestion.complexityScore}/10
                  </p>
                  <p>
                    <strong>Overall Workload Score:</strong> {aiSuggestion.workloadScore.toFixed(1)}
                  </p>
                  {aiSuggestion.note && (
                    <p className="text-sm text-gray-600 mt-2">{aiSuggestion.note}</p>
                  )}
                  <button
                    onClick={() => handleAssignToEmployee(aiSuggestion.assigneeId)}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Assign to Suggested Employee
                  </button>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium mb-2">Or Choose Another Employee</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employees.map(employee => (
                  <div
                    key={employee._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAssignToEmployee(employee._id)}
                  >
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-gray-600">{employee.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {}
      {showDeadlineModal && selectedTaskForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Set Task Deadline</h3>
              <button
                onClick={() => {
                  setShowDeadlineModal(false);
                  setSelectedTaskForEdit(null);
                  setNewDeadline('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Deadline
              </label>
              <input
                type="date"
                value={newDeadline}
                onChange={e => setNewDeadline(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeadlineModal(false);
                  setSelectedTaskForEdit(null);
                  setNewDeadline('');
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDeadline}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Deadline
              </button>
            </div>
          </div>
        </div>
      )}
      {}
      {showStatusModal && selectedTaskForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Update Task Status</h3>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedTaskForEdit(null);
                  setNewStatus('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Status</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedTaskForEdit(null);
                  setNewStatus('');
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}
      {}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Daily Activity Summary</h3>
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  setSummaryContent('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="whitespace-pre-line">{summaryContent}</div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  setSummaryContent('');
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {}
      {showSuggestionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Suggested Upcoming Tasks</h3>
              <button
                onClick={() => {
                  setShowSuggestionsModal(false);
                  setSuggestions([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 overflow-y-auto flex-grow pr-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-lg">{suggestion.title}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        suggestion.priority === 'High'
                          ? 'bg-red-100 text-red-800'
                          : suggestion.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {suggestion.priority} Priority
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{suggestion.description}</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Reason:</span> {suggestion.reason}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setFormData({
                          title: suggestion.title,
                          description: suggestion.description,
                        });
                        setShowSuggestionsModal(false);
                        setSuggestions([]);
                        const form = document.getElementById('createTaskForm');
                        form.classList.remove('hidden');
                        form.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="mt-2 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                    >
                      Create This Task
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setShowSuggestionsModal(false);
                  setSuggestions([]);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <button
              onClick={() => {
                const form = document.getElementById('createTaskForm');
                form.classList.toggle('hidden');
                if (!form.classList.contains('hidden')) {
                  form.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              ➕ Create New Task
            </button>
          )}
          <button
            onClick={handleSuggestions}
            disabled={isGeneratingSuggestions}
            className={`px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 ${
              isGeneratingSuggestions ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isGeneratingSuggestions ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                Generating...
              </>
            ) : (
              'Get Task Suggestions'
            )}
          </button>
          <button
            onClick={handleSummary}
            disabled={isGeneratingSummary}
            className={`px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 ${
              isGeneratingSummary ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isGeneratingSummary ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                Generating...
              </>
            ) : (
              'Get Summary'
            )}
          </button>
          <span className="text-gray-700">Welcome, {user.name}!</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="mb-6">
        {tasks.length === 0 ? (
          <p>
            No tasks found. {isAdmin ? 'Add a task to get started.' : 'You have no assigned tasks.'}
          </p>
        ) : (
          <div>
            {tasks.map(task => (
              <div key={task._id} className="bg-white p-4 rounded shadow mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  {isAdmin && (
                    <button
                      onClick={() => handleEditTitle(task)}
                      className="text-gray-500 hover:text-blue-600"
                      title="Edit title"
                    >
                      ✏️
                    </button>
                  )}
                </div>
                <div className="flex items-start gap-2 mb-2">
                  <p className="flex-grow">{task.description}</p>
                  {isAdmin && (
                    <button
                      onClick={() => handleEditDescription(task)}
                      className="text-gray-500 hover:text-blue-600"
                      title="Edit description"
                    >
                      ✏️
                    </button>
                  )}
                </div>
                {}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Created:</span> {formatDate(task.createdAt)}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Modified:</span> {formatDate(task.updatedAt)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-600 flex items-center gap-2">
                      <span className="font-medium">Deadline:</span> {formatDate(task.deadline)}
                      {isAdmin && (
                        <button
                          onClick={() => handleEditDeadline(task)}
                          className="text-gray-500 hover:text-blue-600"
                          title="Edit deadline"
                        >
                          ✏️
                        </button>
                      )}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <span className="font-medium">Status:</span>{' '}
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}
                      >
                        {task.status}
                      </span>
                      <button
                        onClick={() => handleEditStatus(task)}
                        className="text-gray-500 hover:text-blue-600"
                        title="Edit status"
                      >
                        ✏️
                      </button>
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Created by: {task.createdBy ? task.createdBy.name : 'Unknown'}
                  {task.createdBy && task.createdBy.email ? ' (' + task.createdBy.email + ')' : ''}
                  {task.assignedTo ? ' | Assigned to: ' + task.assignedTo.name : ''}
                </p>
                {isAdmin && (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleOptimize(task)}
                      disabled={isOptimizing[task._id]}
                      className={`px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 ${
                        isOptimizing[task._id] ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isOptimizing[task._id] ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-1"></div>
                          Optimizing...
                        </>
                      ) : (
                        'Optimize'
                      )}
                    </button>
                    <button
                      onClick={() => handleAssign(task)}
                      disabled={isAssigning[task._id]}
                      className={`px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 ${
                        isAssigning[task._id] ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isAssigning[task._id] ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-1"></div>
                          Assigning...
                        </>
                      ) : (
                        'Assign'
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {isAdmin && (
        <div id="createTaskForm" className="bg-white p-6 rounded-lg shadow-lg mb-6 hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Create New Task</h3>
            <button
              onClick={() => document.getElementById('createTaskForm').classList.add('hidden')}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                name="title"
                placeholder="Enter task title"
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Description
              </label>
              <textarea
                name="description"
                placeholder="Enter task description"
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => document.getElementById('createTaskForm').classList.add('hidden')}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
export default Dashboard;
