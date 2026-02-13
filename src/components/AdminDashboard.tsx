// src/components/AdminDashboard.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, Task } from "../contexts/UserContext";
import "./Dashboard.css";

const AdminDashboard: React.FC = () => {
  const {
    getTasksForAdminReview,
    adminReviewTask,
    logout,
    user,
    teamMembers,
    addTask,
  } = useUser();
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    dueDate: "",
    assignedTo: "",
    projectId: "1",
  });

  const tasksToReview = getTasksForAdminReview();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  const handleCreateTask = () => {
    if (
      !newTask.title ||
      !newTask.description ||
      !newTask.assignedTo ||
      !newTask.dueDate
    ) {
      alert("❌ Please fill all required fields");
      return;
    }

    const staffMember = teamMembers.find((m) => m.email === newTask.assignedTo);
    if (!staffMember) {
      alert("❌ Selected staff member not found");
      return;
    }

    addTask({
      title: newTask.title,
      description: newTask.description,
      status: "pending",
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      assignedTo: newTask.assignedTo,
      projectId: newTask.projectId,
    });

    alert(`✓ Task created and assigned to ${staffMember.name}`);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      assignedTo: "",
      projectId: "1",
    });
    setShowCreateForm(false);
  };

  const handleApprove = () => {
    if (selectedTask) {
      adminReviewTask(selectedTask.id, true, reviewComments);
      setSelectedTask(null);
      setReviewComments("");
      setShowReviewForm(false);
      alert("✓ Task approved! Sent to superadmin for final approval.");
    }
  };

  const handleReject = () => {
    if (selectedTask) {
      if (!reviewComments.trim()) {
        alert("❌ Please provide reason for rejection");
        return;
      }
      adminReviewTask(selectedTask.id, false, reviewComments);
      setSelectedTask(null);
      setReviewComments("");
      setShowReviewForm(false);
      alert("✓ Task rejected. Staff member will see your comments.");
    }
  };

  const getStaffName = (email: string) => {
    const member = teamMembers.find((m) => m.email === email);
    return member ? member.name : email;
  };

  return (
    <div className="dashboard">
      <div
        className="dashboard-header"
        style={{
          background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
        }}
      >
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">📋 Admin Dashboard</h1>
            <p className="header-subtitle">
              {tasksToReview.length} task{tasksToReview.length !== 1 ? "s" : ""}{" "}
              pending review
            </p>
            {user && (
              <p style={{ fontSize: "12px", opacity: 0.9, marginTop: "8px" }}>
                👤 {user.name} (Admin) • {user.email}
              </p>
            )}
          </div>
          <div className="header-right">
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                marginRight: "12px",
                background: "white",
                color: "#FF9800",
                padding: "12px 16px",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.3s ease",
                fontSize: "14px",
              }}
            >
              ➕ Create & Assign Task
            </button>
            <button
              onClick={handleLogout}
              style={{
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
              <p className="stat-label">Pending Review</p>
              <p className="stat-value">{tasksToReview.length}</p>
            </div>
          </div>
        </div>

        {/* Create Task Form */}
        {showCreateForm && (
          <div
            style={{
              marginBottom: "20px",
              background: "white",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 4px 16px rgba(255, 152, 0, 0.15)",
              borderLeft: "4px solid #FF9800",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "16px", color: "#333" }}>
              Create & Assign New Task
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  📝 Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="e.g., Design landing page"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  📅 Due Date *
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  👤 Assign to Staff *
                </label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) =>
                    setNewTask({ ...newTask, assignedTo: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">Select staff member...</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.email}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  🎯 Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value as any })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                📄 Description *
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Detailed task description..."
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  minHeight: "80px",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button
                onClick={handleCreateTask}
                style={{
                  background: "#FF9800",
                  color: "white",
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ✓ Create Task
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
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

        {/* Review Form */}
        {showReviewForm && selectedTask && (
          <div
            style={{
              marginBottom: "20px",
              background: "white",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 4px 16px rgba(255, 152, 0, 0.15)",
              borderLeft: "4px solid #FF9800",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "16px", color: "#333" }}>
              Review Completed Task: {selectedTask.title}
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
                <strong>Assigned to:</strong>{" "}
                {getStaffName(selectedTask.assignedTo)}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Priority:</strong> {selectedTask.priority.toUpperCase()}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Description:</strong> {selectedTask.description}
              </p>

              {selectedTask.completionNotes && (
                <>
                  <hr
                    style={{
                      margin: "12px 0",
                      border: "none",
                      borderTop: "1px solid #ddd",
                    }}
                  />
                  <p style={{ margin: "8px 0", fontWeight: "600" }}>
                    💬 Staff's Completion Notes:
                  </p>
                  <p
                    style={{
                      margin: "8px 0",
                      fontStyle: "italic",
                      color: "#555",
                    }}
                  >
                    {selectedTask.completionNotes}
                  </p>
                </>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="comments"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                💬 Your Review Comments
              </label>
              <textarea
                id="comments"
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Enter your review notes or reasons for rejection..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  minHeight: "100px",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleApprove}
                style={{
                  background: "#28a745",
                  color: "white",
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ✓ Approve & Send to Superadmin
              </button>
              <button
                onClick={handleReject}
                style={{
                  background: "#dc3545",
                  color: "white",
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ✕ Reject Task
              </button>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setSelectedTask(null);
                  setReviewComments("");
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

        {/* Tasks List */}
        <div>
          {tasksToReview.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#999",
                background: "white",
                borderRadius: "12px",
              }}
            >
              <p style={{ fontSize: "18px", marginBottom: "8px" }}>
                ✓ All caught up!
              </p>
              <p>No tasks pending review at the moment.</p>
            </div>
          ) : (
            tasksToReview.map((task) => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <div>
                    <h3 className="task-title">{task.title}</h3>
                    <p className="task-description">{task.description}</p>
                  </div>
                </div>

                <div className="task-tags">
                  <span
                    style={{
                      background: "#FFF3E0",
                      color: "#FF9800",
                      padding: "6px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    ⏳ PENDING REVIEW
                  </span>
                  <span
                    style={{
                      background:
                        task.priority === "high" ? "#FFEBEE" : "#FFF3E0",
                      color: task.priority === "high" ? "#D32F2F" : "#F57C00",
                      padding: "6px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {task.priority.toUpperCase()}
                  </span>
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
                    <strong>Assigned to:</strong>{" "}
                    {getStaffName(task.assignedTo)}
                  </div>
                  <div>
                    <strong>Due:</strong>{" "}
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>

                {task.completionNotes && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "10px",
                      background: "#F5F5F5",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  >
                    <strong>Staff Notes:</strong> {task.completionNotes}
                  </div>
                )}

                <div className="task-footer">
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setShowReviewForm(true);
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
                    📋 Review Task
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
