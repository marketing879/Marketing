// src/components/StaffDashboard.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, Task } from "../contexts/UserContext";
import "./Dashboard.css";

const StaffDashboard: React.FC = () => {
  const {
    getAssignedTasks,
    submitTaskCompletion,
    logout,
    user,
    getTeamMemberByEmail,
    getProjectById,
  } = useUser();
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  const assignedTasks = getAssignedTasks();
  const pendingTasks = assignedTasks.filter((t) => t.status !== "completed");
  const completedTasks = assignedTasks.filter((t) => t.status === "completed");

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  const handleMarkComplete = () => {
    if (!selectedTask) return;
    if (!completionNotes.trim()) {
      alert("❌ Please add notes about task completion");
      return;
    }
    if (window.confirm("Mark this task as complete and submit for approval?")) {
      submitTaskCompletion(selectedTask.id, completionNotes);
      setSelectedTask(null);
      setCompletionNotes("");
      setShowCompletionForm(false);
      alert("✓ Task marked complete! Waiting for admin review.");
    }
  };

  const getStatusBadge = (task: Task) => {
    const styles: { [key: string]: React.CSSProperties } = {
      pending: { background: "#FFF3E0", color: "#FF9800" },
      "in-progress": { background: "#E3F2FD", color: "#1976D2" },
      completed: { background: "#E8F5E9", color: "#388E3C" },
      "on-hold": { background: "#FFEBEE", color: "#C62828" },
    };
    const style = styles[task.status] || styles.pending;
    return (
      <span
        style={{
          ...style,
          padding: "6px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        {task.status.replace("-", " ").toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: { bg: "#FFEBEE", text: "#C62828" },
      medium: { bg: "#FFF3E0", text: "#FF9800" },
      low: { bg: "#E8F5E9", text: "#388E3C" },
    };
    const color = colors[priority] || colors.medium;
    return (
      <span
        style={{
          background: color.bg,
          color: color.text,
          padding: "6px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        {priority.toUpperCase()} PRIORITY
      </span>
    );
  };

  const getApprovalStatusBadge = (task: Task) => {
    const statuses: {
      [key: string]: { bg: string; text: string; label: string };
    } = {
      assigned: { bg: "#E3F2FD", text: "#1976D2", label: "📌 Assigned" },
      "in-review": {
        bg: "#FFF3E0",
        text: "#FF9800",
        label: "⏳ Pending Admin Review",
      },
      "admin-approved": {
        bg: "#E3F2FD",
        text: "#1976D2",
        label: "✓ Admin Approved",
      },
      "superadmin-approved": {
        bg: "#E8F5E9",
        text: "#388E3C",
        label: "✓✓ Fully Approved",
      },
      rejected: { bg: "#FFEBEE", text: "#C62828", label: "✕ Rejected" },
    };
    const status = statuses[task.approvalStatus] || statuses.assigned;
    return (
      <span
        style={{
          background: status.bg,
          color: status.text,
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: "600",
        }}
      >
        {status.label}
      </span>
    );
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="task-card">
      <div className="task-header">
        <div>
          <h3 className="task-title">{task.title}</h3>
          <p className="task-description">{task.description}</p>
        </div>
      </div>

      <div className="task-tags">
        {getPriorityBadge(task.priority)}
        {getStatusBadge(task)}
        {getApprovalStatusBadge(task)}
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "12px",
          fontSize: "13px",
          color: "#666",
        }}
      >
        <div>
          <strong>Due Date:</strong>{" "}
          {new Date(task.dueDate).toLocaleDateString()}
        </div>
        <div>
          <strong>Project:</strong>{" "}
          {getProjectById(task.projectId)?.name || "N/A"}
        </div>
        <div>
          <strong>Created:</strong>{" "}
          {new Date(task.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Show rejection reason if rejected */}
      {task.approvalStatus === "rejected" && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            background: "#FFEBEE",
            borderRadius: "6px",
            fontSize: "13px",
            color: "#C62828",
          }}
        >
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>⚠️ Task was rejected</strong>
          </p>
          {task.adminComments && (
            <p style={{ margin: "0" }}>
              <strong>Reason:</strong> {task.adminComments}
            </p>
          )}
        </div>
      )}

      {/* Completion Notes if completed */}
      {task.status === "completed" && task.completionNotes && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            background: "#F5F5F5",
            borderRadius: "6px",
            fontSize: "13px",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontWeight: "600" }}>
            📝 Your Completion Notes:
          </p>
          <p style={{ margin: "0" }}>{task.completionNotes}</p>
        </div>
      )}

      {/* Admin Comments if reviewed */}
      {task.adminReviewedBy && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            background: "#F9F9F9",
            borderRadius: "6px",
            fontSize: "13px",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontWeight: "600" }}>
            👨‍💼 Admin Review by {task.adminReviewedBy} ({task.adminReviewedAt})
          </p>
          {task.adminComments && (
            <p style={{ margin: "0" }}>
              <strong>Comments:</strong> {task.adminComments}
            </p>
          )}
        </div>
      )}

      <div className="task-footer">
        {task.status !== "completed" && task.approvalStatus === "assigned" && (
          <button
            onClick={() => {
              setSelectedTask(task);
              setShowCompletionForm(true);
            }}
            style={{
              background: "#667eea",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ✓ Mark as Complete
          </button>
        )}
        {task.status === "completed" && task.approvalStatus === "in-review" && (
          <span
            style={{ fontSize: "13px", color: "#FF9800", fontWeight: "600" }}
          >
            ⏳ Waiting for admin review...
          </span>
        )}
        {task.approvalStatus === "admin-approved" && (
          <span
            style={{ fontSize: "13px", color: "#1976D2", fontWeight: "600" }}
          >
            ✓ Admin approved, waiting for superadmin...
          </span>
        )}
        {task.approvalStatus === "superadmin-approved" && (
          <span
            style={{ fontSize: "13px", color: "#388E3C", fontWeight: "600" }}
          >
            ✓✓ Fully Approved!
          </span>
        )}
        {task.approvalStatus === "rejected" && (
          <button
            onClick={() => {
              setSelectedTask(task);
              setShowCompletionForm(true);
              setCompletionNotes("");
            }}
            style={{
              background: "#FF9800",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            🔄 Resubmit Completion
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <div
        className="dashboard-header"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">My Tasks</h1>
            <p className="header-subtitle">
              {pendingTasks.length} pending • {completedTasks.length} completed
            </p>
            {user && (
              <p style={{ fontSize: "12px", opacity: 0.9, marginTop: "8px" }}>
                👤 {user.name} • {user.email}
              </p>
            )}
          </div>
          <div className="header-right">
            <button
              onClick={handleLogout}
              style={{
                marginLeft: "12px",
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                padding: "12px 16px",
                border: "2px solid white",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.3s ease",
                fontSize: "14px",
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#FFF3E0" }}>
              ⏳
            </div>
            <div className="stat-content">
              <p className="stat-label">Pending Tasks</p>
              <p className="stat-value">{pendingTasks.length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#E8F5E9" }}>
              ✓
            </div>
            <div className="stat-content">
              <p className="stat-label">Completed</p>
              <p className="stat-value">{completedTasks.length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#E3F2FD" }}>
              📊
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Assigned</p>
              <p className="stat-value">{assignedTasks.length}</p>
            </div>
          </div>
        </div>

        {/* Completion Form Modal */}
        {showCompletionForm && selectedTask && (
          <div
            style={{
              marginBottom: "20px",
              background: "white",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 4px 16px rgba(102, 126, 234, 0.15)",
              borderLeft: "4px solid #667eea",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "16px", color: "#333" }}>
              Complete Task: {selectedTask.title}
            </h2>

            <div
              style={{
                marginBottom: "16px",
                background: "#F5F5F5",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              <p style={{ margin: "8px 0" }}>
                <strong>Priority:</strong> {selectedTask.priority.toUpperCase()}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Due Date:</strong>{" "}
                {new Date(selectedTask.dueDate).toLocaleDateString()}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Description:</strong> {selectedTask.description}
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="notes"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                📝 Completion Notes (Required)
              </label>
              <textarea
                id="notes"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Describe what you completed, any challenges faced, and current status..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  minHeight: "120px",
                  fontFamily: "inherit",
                }}
              />
              <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                💡 Tip: Write detailed notes about what you completed. This
                helps your admin understand your work.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleMarkComplete}
                style={{
                  background: "#667eea",
                  color: "white",
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ✓ Submit Completion
              </button>
              <button
                onClick={() => {
                  setShowCompletionForm(false);
                  setSelectedTask(null);
                  setCompletionNotes("");
                }}
                style={{
                  background: "#6c757d",
                  color: "white",
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div>
            <h3
              style={{
                marginBottom: "16px",
                color: "#333",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              📋 Pending Tasks ({pendingTasks.length})
            </h3>
            <div style={{ marginBottom: "30px" }}>
              {pendingTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3
              style={{
                marginBottom: "16px",
                color: "#333",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              ✓ Completed Tasks ({completedTasks.length})
            </h3>
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {assignedTasks.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "white",
              borderRadius: "12px",
              color: "#999",
            }}
          >
            <p style={{ fontSize: "20px", marginBottom: "8px" }}>
              ✨ All caught up!
            </p>
            <p>No tasks assigned to you at the moment.</p>
            <p style={{ fontSize: "13px", marginTop: "16px" }}>
              New tasks will appear here when your admin assigns them to you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
