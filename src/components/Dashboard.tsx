import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, Task } from "../contexts/UserContext";
import TaskNewAssignment from "./TaskNewAssignment";
import "./Dashboard.css";
import "./SADashboard.css"; // Import premium Superadmin Dashboard styles

const Dashboard: React.FC = () => {
  const { tasks, deleteTask, projects, getProjectById, user, logout } =
    useUser();
  const navigate = useNavigate();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const handleAddNewTask = () => {
    setTaskToEdit(null);
    setShowTaskForm(true);
  };

  const handleCancelTaskForm = () => {
    setShowTaskForm(false);
    setTaskToEdit(null);
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTaskToEdit(task);
      setShowTaskForm(true);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
    }
  };

  const handleTaskSuccess = () => {
    setShowTaskForm(false);
    setTaskToEdit(null);
  };

  // Add User handler - Only for Superadmin
  const handleAddUser = () => {
    navigate("/add-user");
  };

  // Logout handler
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  const getProjectColor = (projectId?: string) => {
    if (!projectId) return "#9CA3AF";
    const project = projects.find((p) => p.id === projectId);
    return project?.color || "#9CA3AF";
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return "No Project";
    const project = getProjectById(projectId);
    return project ? project.name : "Unknown Project";
  };

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in-progress"
  ).length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const progressPercentage =
    tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const TaskListEmptyState = () => (
    <div className="empty-state">
      <div className="empty-icon">📋</div>
      <h3>No tasks available</h3>
      <p>Click "Add New Task" to create your first task</p>
    </div>
  );

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="task-card">
      <div className="task-header">
        <div>
          <h3 className="task-title">{task.title}</h3>
          <p className="task-description">{task.description}</p>
        </div>
      </div>

      <div className="task-tags">
        <span className="task-tag task-priority">
          {task.priority.toUpperCase()}
        </span>
        <span className="task-tag task-status">
          {task.status.replace("-", " ").toUpperCase()}
        </span>
        <span
          className="task-tag task-project"
          style={{ backgroundColor: getProjectColor(task.projectId) }}
        >
          📁 {getProjectName(task.projectId)}
        </span>
      </div>

      <div className="task-meta">
        <div className="meta-row">
          <span className="meta-label">Assigned to:</span>
          <span className="meta-value">{task.assignedTo || "Unassigned"}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Due Date:</span>
          <span className="meta-value">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Created:</span>
          <span className="meta-value">
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="task-footer">
        <button
          onClick={() => handleEditTask(task.id)}
          className="btn-edit-task"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => handleDeleteTask(task.id)}
          className="btn-delete-task"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="sa-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">
              <span className="title-icon">✨</span>
              Task Management Board
            </h1>
            <p className="header-subtitle">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
            </p>
            {user && (
              <div className="user-info">
                <span className="user-badge">👤</span>
                <span className="user-name">{user.name}</span>
                <span className="user-separator">•</span>
                <span className="user-email">{user.email}</span>
                <span className="user-separator">•</span>
                <span className="user-role">{user.role}</span>
              </div>
            )}
          </div>
          <div className="header-right">
            {/* Add User Button - Only for Superadmin */}
            {user?.role === "superadmin" && (
              <button onClick={handleAddUser} className="btn-add-user">
                <span>👤</span>
                Add User
              </button>
            )}

            <button onClick={handleAddNewTask} className="btn-add-task">
              ➕ Add New Task
            </button>

            <button onClick={handleLogout} className="btn-logout">
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
            }}
          >
            📊
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Tasks</p>
            <p className="stat-value">{tasks.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
            }}
          >
            ✓
          </div>
          <div className="stat-content">
            <p className="stat-label">Completed</p>
            <p className="stat-value">{completedTasks}</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            }}
          >
            ⏳
          </div>
          <div className="stat-content">
            <p className="stat-label">In Progress</p>
            <p className="stat-value">{inProgressTasks}</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              background: "linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)",
            }}
          >
            ⏱️
          </div>
          <div className="stat-content">
            <p className="stat-label">Pending</p>
            <p className="stat-value">{pendingTasks}</p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {tasks.length > 0 && (
        <div className="progress-section">
          <h3>Task Completion Progress</h3>
          <p>
            {completedTasks} of {tasks.length} tasks completed (
            {progressPercentage.toFixed(0)}%)
          </p>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Task Form */}
      {showTaskForm && (
        <div className="tasks-section">
          <div
            style={{
              marginBottom: "20px",
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              border: "1px solid rgba(124, 58, 237, 0.1)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "24px",
                fontSize: "24px",
                fontWeight: "800",
                background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {taskToEdit ? "✏️ Edit Task" : "➕ Add New Task"}
            </h2>
            <TaskNewAssignment
              onCancel={handleCancelTaskForm}
              onTaskCreated={handleTaskSuccess}
              taskToEdit={taskToEdit}
            />
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="tasks-section">
        <div className="tasks-grid">
          {tasks.length === 0 ? (
            <TaskListEmptyState />
          ) : (
            tasks.map((task) => <TaskItem key={task.id} task={task} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
