import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, Task } from "../contexts/UserContext";
import "./SADashboard.css";

const SADashboard: React.FC = () => {
  const { tasks, user, logout, updateTask } = useUser();
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  // Handle Add User
  const handleAddUser = () => {
    navigate("/add-user");
  };

  // Handle Logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  // Filter tasks pending final approval
  const pendingApprovalTasks = tasks.filter(
    (t) => t.status === "under-review" && t.adminReview
  );

  const approvedTasks = tasks.filter(
    (t) =>
      t.status === "completed" && (t as any).superadminApproval === "approved"
  );

  const rejectedTasks = tasks.filter(
    (t) => (t as any).superadminApproval === "rejected"
  );

  // Handle Approve
  const handleApprove = (task: Task) => {
    if (window.confirm("Approve this task for final completion?")) {
      updateTask(task.id, {
        status: "completed",
        superadminApproval: "approved",
        superadminReview: "Approved by Superadmin",
        superadminReviewedBy: user?.name || "Superadmin",
        superadminReviewedAt: new Date().toISOString(),
      } as any);
    }
  };

  // Handle Reject
  const handleReject = (task: Task) => {
    setSelectedTask(task);
    setShowReviewModal(true);
  };

  // Submit Rejection
  const submitRejection = () => {
    if (!selectedTask) return;
    if (!reviewNotes.trim()) {
      alert("Please provide rejection notes");
      return;
    }

    updateTask(selectedTask.id, {
      status: "in-progress",
      superadminApproval: "rejected",
      superadminReview: reviewNotes,
      superadminReviewedBy: user?.name || "Superadmin",
      superadminReviewedAt: new Date().toISOString(),
    } as any);

    setShowReviewModal(false);
    setSelectedTask(null);
    setReviewNotes("");
  };

  return (
    <div className="sa-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">
              <span className="title-icon">👑</span>
              Superadmin Dashboard
            </h1>
            <p className="header-subtitle">
              Final approval for {pendingApprovalTasks.length} tasks
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
            <button onClick={handleAddUser} className="btn-add-user">
              <span>👤</span>
              Add New User
            </button>
            <button onClick={handleLogout} className="btn-logout">
              <span>🚪</span>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <p className="stat-label">Pending Final Approval</p>
            <p className="stat-value">{pendingApprovalTasks.length}</p>
          </div>
        </div>

        <div className="stat-card approved">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <p className="stat-label">Approved</p>
            <p className="stat-value">{approvedTasks.length}</p>
          </div>
        </div>

        <div className="stat-card rejected">
          <div className="stat-icon">✗</div>
          <div className="stat-content">
            <p className="stat-label">Rejected</p>
            <p className="stat-value">{rejectedTasks.length}</p>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="tasks-section">
        <div className="section-header">
          <h2>
            <span>📋</span>
            Pending Final Approval ({pendingApprovalTasks.length})
          </h2>
        </div>

        {pendingApprovalTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <h3>All approved!</h3>
            <p>No tasks pending final approval at the moment.</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {pendingApprovalTasks.map((task) => {
              const taskAny = task as any;
              return (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <div className="task-title-section">
                      <h3 className="task-title">{task.title}</h3>
                      <div className="priority-badge priority-high">
                        ⚡ {task.priority.toUpperCase()}
                      </div>
                    </div>
                    <div className="task-status">Under Review</div>
                  </div>

                  <p className="task-description">{task.description}</p>

                  <div className="task-meta">
                    <div className="meta-row">
                      <span className="meta-label">Assigned to:</span>
                      <span className="meta-value">{task.assignedTo}</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">Due Date:</span>
                      <span className="meta-value">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">Completed:</span>
                      <span className="meta-value">
                        {taskAny.completedAt
                          ? new Date(taskAny.completedAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {taskAny.completionNotes && (
                    <div className="completion-notes">
                      <strong>📝 Staff Completion Notes:</strong>
                      <p>{taskAny.completionNotes}</p>
                    </div>
                  )}

                  {taskAny.adminReview && (
                    <div className="admin-review">
                      <strong>👨‍💼 Admin Review:</strong>
                      <p>{taskAny.adminReview}</p>
                      {taskAny.adminReviewedBy && (
                        <p className="reviewer-info">
                          Reviewed by: {taskAny.adminReviewedBy}
                          {taskAny.adminReviewedAt &&
                            ` on ${new Date(
                              taskAny.adminReviewedAt
                            ).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="task-actions">
                    <button
                      onClick={() => handleApprove(task)}
                      className="btn-approve"
                    >
                      <span>✓</span>
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(task)}
                      className="btn-reject"
                    >
                      <span>✗</span>
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedTask && (
        <div
          className="modal-overlay"
          onClick={() => setShowReviewModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Task</h2>
              <button
                className="modal-close"
                onClick={() => setShowReviewModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <h3 className="modal-task-title">{selectedTask.title}</h3>
              <p className="modal-label">Please provide rejection notes:</p>
              <textarea
                className="modal-textarea"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Explain why this task is being rejected..."
                rows={5}
              />
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn-cancel"
                onClick={() => setShowReviewModal(false)}
              >
                Cancel
              </button>
              <button className="modal-btn-submit" onClick={submitRejection}>
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Add User Button */}
      <button onClick={handleAddUser} className="floating-add-user">
        <span className="fab-icon">👤</span>
        <span className="fab-text">Add New User</span>
      </button>
    </div>
  );
};

export default SADashboard;
