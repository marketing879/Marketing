// src/components/AddNewUserForm.tsx
// ONLY SUPERADMIN CAN ACCESS - Integrates with existing UserContext
// Updated to use AddNewUser.css classes

import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";
import "./AddNewUserForm.css";

interface FormData {
  name: string;
  email: string;
  role: string; // Job role (Graphic Designer, etc.)
  systemRole: "staff" | "admin" | "superadmin"; // System access role
  isDoer: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
  systemRole?: string;
}

interface AddNewUserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Generate User ID based on email and system role
const generateUserId = (email: string, systemRole: string): string => {
  const prefixes: { [key: string]: string } = {
    staff: "STF",
    admin: "ADM",
    superadmin: "SPA",
  };

  const prefix = prefixes[systemRole.toLowerCase()] || "USR";
  const emailPrefix = email.split("@")[0].substring(0, 4).toUpperCase();
  const timestamp = Date.now().toString(36).substring(-4).toUpperCase();

  return `${prefix}-${emailPrefix}-${timestamp}`;
};

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const AddNewUserForm: React.FC<AddNewUserFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { addTeamMember, user } = useUser(); // Get current logged-in user

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "",
    systemRole: "staff",
    isDoer: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showCredentials, setShowCredentials] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    userId: string;
    email: string;
    otp: string;
    name: string;
    systemRole: string;
  } | null>(null);

  // CHECK IF USER IS SUPERADMIN
  if (!user || user.role !== "superadmin") {
    return (
      <div className="add-user-container">
        <div className="add-user-form">
          <div className="access-denied">
            <div className="denied-icon">
              <span>🚫</span>
            </div>
            <h2 className="denied-title">Access Denied</h2>
            <p className="denied-message">
              Only Superadmin can create new users and assign system access
              roles.
            </p>
            <button onClick={onCancel} className="btn btn-back">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.role.trim()) {
      newErrors.role = "Job role is required";
    }

    if (!formData.systemRole) {
      newErrors.systemRole = "System access role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Generate User ID and OTP
      const userId = generateUserId(formData.email, formData.systemRole);
      const otp = generateOTP();

      // Add the user to context - matches your TeamMember interface
      addTeamMember({
        name: formData.name,
        email: formData.email,
        role: formData.role, // Job role
        isActive: true,
        // Store additional data in avatar field as JSON (temporary solution)
        avatar: JSON.stringify({
          userId,
          systemRole: formData.systemRole,
          otp,
          isDoer: formData.isDoer,
          createdBy: user.email,
          createdAt: new Date().toISOString(),
        }),
      });

      // Store credentials in localStorage for login validation
      const userCredentials = JSON.parse(
        localStorage.getItem("userCredentials") || "[]"
      );
      userCredentials.push({
        userId,
        email: formData.email,
        otp,
        systemRole: formData.systemRole,
        name: formData.name,
      });
      localStorage.setItem("userCredentials", JSON.stringify(userCredentials));

      // Store credentials to show
      setGeneratedCredentials({
        userId,
        email: formData.email,
        otp,
        name: formData.name,
        systemRole: formData.systemRole,
      });

      setShowCredentials(true);
      console.log(`✓ User created: ${formData.name} (${formData.systemRole})`);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`✅ ${label} copied to clipboard!`);
  };

  // Reset and create another
  const handleCreateAnother = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      systemRole: "staff",
      isDoer: true,
    });
    setErrors({});
    setShowCredentials(false);
    setGeneratedCredentials(null);
  };

  // Handle done
  const handleDone = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      systemRole: "staff",
      isDoer: true,
    });
    setErrors({});
    setShowCredentials(false);
    setGeneratedCredentials(null);

    if (onSuccess) {
      onSuccess();
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    if (formData.name || formData.email || formData.role) {
      if (
        window.confirm(
          "Are you sure you want to cancel? All changes will be lost."
        )
      ) {
        if (onCancel) {
          onCancel();
        }
      }
    } else {
      if (onCancel) {
        onCancel();
      }
    }
  };

  // Show credentials screen
  if (showCredentials && generatedCredentials) {
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-header">
            <div className="success-icon">
              <span>✓</span>
            </div>
            <h2 className="success-title">User Created Successfully!</h2>
            <p className="success-subtitle">
              Share these credentials with {generatedCredentials.name}
            </p>
          </div>

          {/* Warning */}
          <div className="warning-box">
            <div className="warning-content">
              <span className="warning-icon">⚠️</span>
              <div>
                <p className="warning-title">
                  Important: Save These Credentials
                </p>
                <p className="warning-text">
                  The OTP is the password for login. Share it securely with the
                  user.
                </p>
              </div>
            </div>
          </div>

          {/* User ID */}
          <div className="credential-box">
            <label className="credential-label">User ID</label>
            <div className="credential-display">
              <code className="credential-code">
                {generatedCredentials.userId}
              </code>
              <button
                onClick={() =>
                  copyToClipboard(generatedCredentials.userId, "User ID")
                }
                className="btn-copy"
              >
                📋 Copy
              </button>
            </div>
          </div>

          {/* Email (Username) */}
          <div className="credential-box">
            <label className="credential-label">
              Email (Username for Login)
            </label>
            <div className="credential-display">
              <code className="credential-code">
                {generatedCredentials.email}
              </code>
              <button
                onClick={() =>
                  copyToClipboard(generatedCredentials.email, "Email")
                }
                className="btn-copy"
              >
                📋 Copy
              </button>
            </div>
          </div>

          {/* OTP (Password) */}
          <div className="credential-box">
            <label className="credential-label">OTP (Password for Login)</label>
            <div className="credential-display">
              <code className="credential-otp">{generatedCredentials.otp}</code>
              <button
                onClick={() => copyToClipboard(generatedCredentials.otp, "OTP")}
                className="btn-copy"
              >
                📋 Copy
              </button>
            </div>
          </div>

          {/* System Role */}
          <div className="credential-box">
            <label className="credential-label">System Access Level</label>
            <div className="credential-value">
              <span>{generatedCredentials.systemRole}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="instructions-box">
            <h3 className="instructions-title">
              📧 Login Instructions for User:
            </h3>
            <ol className="instructions-list">
              <li>Go to the login page</li>
              <li>
                Enter Email: <strong>{generatedCredentials.email}</strong>
              </li>
              <li>
                Select Role: <strong>{generatedCredentials.systemRole}</strong>
              </li>
              <li>Click "Generate OTP"</li>
              <li>
                Enter OTP: <strong>{generatedCredentials.otp}</strong>
              </li>
              <li>Click "Login"</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              onClick={handleCreateAnother}
              className="btn btn-create-another"
            >
              ➕ Create Another User
            </button>
            <button onClick={handleDone} className="btn btn-done">
              ✓ Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main form (ONLY VISIBLE TO SUPERADMIN)
  return (
    <div className="add-user-container">
      <form onSubmit={handleSubmit} className="add-user-form">
        {/* Header with Superadmin Badge */}
        <div className="form-header">
          <h1 className="form-title">Add Team Member</h1>
          <div className="superadmin-badge">
            <span>👑</span>
            <span>SUPERADMIN ACCESS</span>
          </div>
        </div>

        <p className="form-description">
          Create new users and assign system access roles (Staff, Admin, or
          Superadmin)
        </p>

        {/* Name */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            className={`form-input ${errors.name ? "error" : ""}`}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address *{" "}
            <span className="label-hint">(will be used as username)</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            className={`form-input ${errors.email ? "error" : ""}`}
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        {/* System Role (Staff/Admin/Superadmin) */}
        <div className="form-group">
          <label htmlFor="systemRole" className="form-label">
            System Access Role *{" "}
            <span className="label-hint">(login permissions)</span>
          </label>
          <select
            id="systemRole"
            name="systemRole"
            value={formData.systemRole}
            onChange={handleChange}
            className={`form-select ${errors.systemRole ? "error" : ""}`}
          >
            <option value="staff">👨‍💼 Staff - Basic Access</option>
            <option value="admin">
              📋 Admin - Can manage tasks and review
            </option>
            <option value="superadmin">
              👑 Superadmin - Full System Access
            </option>
          </select>
          {errors.systemRole && (
            <span className="error-message">{errors.systemRole}</span>
          )}
          <div className="role-description">
            <strong>Staff:</strong> Can view and complete assigned tasks
            <br />
            <strong>Admin:</strong> Can create tasks, review staff submissions
            <br />
            <strong>Superadmin:</strong> Can create users, approve admin
            reviews, full access
          </div>
        </div>

        {/* Job Role */}
        <div className="form-group">
          <label htmlFor="role" className="form-label">
            Job Role *{" "}
            <span className="label-hint">(their position/title)</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`form-select ${errors.role ? "error" : ""}`}
          >
            <option value="">Select a job role</option>
            <option value="Graphic Designer">Graphic Designer</option>
            <option value="Senior Graphic Designer">
              Senior Graphic Designer
            </option>
            <option value="Video Editor">Video Editor</option>
            <option value="Copy Writer">Copy Writer</option>
            <option value="AI Creative Lead">AI Creative Lead</option>
            <option value="Corporate Creative Support Lead">
              Corporate Creative Support Lead
            </option>
            <option value="Project Manager">Project Manager</option>
            <option value="Developer">Developer</option>
          </select>
          {errors.role && <span className="error-message">{errors.role}</span>}
        </div>

        {/* Is Doer Checkbox */}
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              id="isDoer"
              name="isDoer"
              checked={formData.isDoer}
              onChange={handleChange}
              className="checkbox-input"
            />
            <span className="checkbox-text">
              Is a Doer (Can be assigned tasks)
            </span>
          </label>
          <p className="checkbox-hint">
            Check this if the team member can be assigned tasks directly
          </p>
        </div>

        {/* Info Box */}
        <div className="info-box">
          <h3 className="info-box-title">
            🔐 Automatic Credentials Generation
          </h3>
          <ul className="info-box-list">
            <li>• User ID will be auto-generated based on email and role</li>
            <li>• 6-digit OTP will be created (used as login password)</li>
            <li>• Email will be the username for login</li>
          </ul>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-cancel"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-submit">
            Create User Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewUserForm;
