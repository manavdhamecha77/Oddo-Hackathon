'use client';

import { useState, useEffect } from 'react';

export default function TestTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [projectId, setProjectId] = useState('1');
  const [userId, setUserId] = useState('1');
  const [loading, setLoading] = useState(false);

  // Form states
  const [newTask, setNewTask] = useState({
    projectId: 1,
    title: '',
    description: '',
    assignedTo: 1,
    priority: 'medium',
    dueDate: '',
    estimatedHours: '',
    createdBy: 1
  });

  const [newComment, setNewComment] = useState({ userId: 1, comment: '' });
  const [newTimesheet, setNewTimesheet] = useState({
    userId: 1,
    projectId: 1,
    workDate: new Date().toISOString().split('T')[0],
    hours: '',
    isBillable: true,
    hourlyRate: 50,
    description: ''
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      const data = await res.json();
      if (data.success) setTasks(data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
    setLoading(false);
  };

  const fetchTaskDetails = async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      const data = await res.json();
      if (data.success) setSelectedTask(data.task);
    } catch (error) {
      console.error('Error fetching task details:', error);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      const data = await res.json();
      if (data.success) {
        alert('Task created successfully!');
        fetchTasks();
        setNewTask({
          projectId: 1,
          title: '',
          description: '',
          assignedTo: 1,
          priority: 'medium',
          dueDate: '',
          estimatedHours: '',
          createdBy: 1
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        alert('Task status updated!');
        fetchTasks();
        if (selectedTask?.id === taskId) fetchTaskDetails(taskId);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment)
      });
      const data = await res.json();
      if (data.success) {
        alert('Comment added!');
        fetchTaskDetails(selectedTask.id);
        setNewComment({ userId: 1, comment: '' });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const logHours = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}/timesheets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTimesheet)
      });
      const data = await res.json();
      if (data.success) {
        alert('Hours logged!');
        fetchTaskDetails(selectedTask.id);
        setNewTimesheet({
          ...newTimesheet,
          hours: '',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error logging hours:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    blocked: 'bg-red-100 text-red-800',
    done: 'bg-green-100 text-green-800'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Task Management Test UI</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Task List & Create */}
          <div className="space-y-6">
            {/* Create Task Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
              <form onSubmit={createTask} className="space-y-4">
                <input
                  type="text"
                  placeholder="Task Title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows="3"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="px-3 py-2 border rounded"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Estimated Hours"
                  value={newTask.estimatedHours}
                  onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  step="0.5"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Create Task
                </button>
              </form>
            </div>

            {/* Task List */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Tasks</h2>
                <button
                  onClick={fetchTasks}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Refresh
                </button>
              </div>
              
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => fetchTaskDetails(task.id)}
                      className="p-4 border rounded cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{task.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${statusColors[task.status]}`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="flex gap-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.assignedUser && (
                          <span className="text-gray-600">
                            @{task.assignedUser.firstName || task.assignedUser.email}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Task Details */}
          <div className="space-y-6">
            {selectedTask ? (
              <>
                {/* Task Details */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">{selectedTask.title}</h2>
                  <p className="text-gray-700 mb-4">{selectedTask.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-sm ${statusColors[selectedTask.status]}`}>
                        {selectedTask.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-sm ${priorityColors[selectedTask.priority]}`}>
                        {selectedTask.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Estimated: {selectedTask.estimatedHours}h | Actual: {selectedTask.actualHours}h
                    </p>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => updateTaskStatus(selectedTask.id, 'new')}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                    >
                      New
                    </button>
                    <button
                      onClick={() => updateTaskStatus(selectedTask.id, 'in_progress')}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => updateTaskStatus(selectedTask.id, 'blocked')}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm"
                    >
                      Blocked
                    </button>
                    <button
                      onClick={() => updateTaskStatus(selectedTask.id, 'done')}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm"
                    >
                      Done
                    </button>
                  </div>

                  {/* Comments */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Comments</h3>
                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                      {selectedTask.comments?.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 p-2 rounded text-sm">
                          <p className="font-semibold">{comment.user.firstName || comment.user.email}</p>
                          <p>{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={addComment} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add comment..."
                        value={newComment.comment}
                        onChange={(e) => setNewComment({ ...newComment, comment: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                </div>

                {/* Log Hours */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold mb-4">Log Hours</h3>
                  <form onSubmit={logHours} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="date"
                        value={newTimesheet.workDate}
                        onChange={(e) => setNewTimesheet({ ...newTimesheet, workDate: e.target.value })}
                        className="px-3 py-2 border rounded"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Hours"
                        value={newTimesheet.hours}
                        onChange={(e) => setNewTimesheet({ ...newTimesheet, hours: e.target.value })}
                        className="px-3 py-2 border rounded"
                        step="0.5"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Description"
                      value={newTimesheet.description}
                      onChange={(e) => setNewTimesheet({ ...newTimesheet, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                      Log Hours
                    </button>
                  </form>

                  {/* Timesheets */}
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-sm">Logged Hours</h4>
                    {selectedTask.timesheets?.map((ts) => (
                      <div key={ts.id} className="bg-gray-50 p-2 rounded text-sm">
                        <p>{new Date(ts.workDate).toLocaleDateString()} - {ts.hours}h</p>
                        <p className="text-gray-600">{ts.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Select a task to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
