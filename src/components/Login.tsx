// src/components/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import "./Login.css";

const Login: React.FC = () => {
  const { login, isAuthenticated } = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<
    "staff" | "admin" | "superadmin"
  >("staff");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setOtpError(null);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 6);
    setOtp(value);
    setOtpError(null);
  };

  const generateOtp = () => {
    if (!email || !email.includes("@")) {
      setOtpError("Please enter a valid email address");
      return;
    }

    // Check if user exists in the system
    const userCredentials = JSON.parse(
      localStorage.getItem("userCredentials") || "[]"
    );
    const userExists = userCredentials.find(
      (u: any) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.systemRole === selectedRole
    );

    if (!userExists) {
      setOtpError(
        `No account found with email ${email} and role ${selectedRole}. Contact your administrator.`
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setOtp("");
      setOtpError(null);
      setIsLoading(false);
      setStep(2);
      console.log("🔐 OTP Required for:", email, `(${selectedRole})`);
      console.log(
        "💡 Hint: Check the credentials provided when the account was created"
      );
    }, 1000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length < 6) {
      setOtpError("Please enter the 6-digit OTP");
      return;
    }

    // Validate OTP against stored credentials
    const userCredentials = JSON.parse(
      localStorage.getItem("userCredentials") || "[]"
    );
    const user = userCredentials.find(
      (u: any) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.otp === otp &&
        u.systemRole === selectedRole
    );

    if (user) {
      console.log("✓ OTP verified for", user.name);
      setLoginSuccess(true);

      setTimeout(() => {
        try {
          console.log("🔄 Logging in:", user.name, `(${selectedRole})`);

          login({
            name: user.name,
            email: user.email,
            role: selectedRole,
          });

          console.log("✓ Login successful, navigating...");
          navigate("/", { replace: true });
        } catch (error) {
          console.error("❌ Login error:", error);
          setOtpError("An error occurred. Please try again.");
          setLoginSuccess(false);
          setStep(1);
        }
      }, 1500);
    } else {
      setOtpError("Invalid OTP. Please check and try again.");
      console.error("❌ Invalid login attempt:", {
        email,
        role: selectedRole,
        otp,
      });
    }
  };

  const resetForm = () => {
    setEmail("");
    setOtp("");
    setOtpError(null);
    setStep(1);
    setLoginSuccess(false);
    setSelectedRole("staff");
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-container">
        <div className="login-brand">
          <div className="brand-content">
            <div className="brand-icon">✨</div>
            <h1>TaskFlow</h1>
            <p>Email-Based Task Management System</p>
            <div className="brand-features">
              <div className="feature">
                <span className="feature-icon">👥</span>
                <span>Staff Task Completion</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📋</span>
                <span>Admin Task Assignment</span>
              </div>
              <div className="feature">
                <span className="feature-icon">👑</span>
                <span>Superadmin Approval</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-form-wrapper">
          <div
            className={`login-form-container ${loginSuccess ? "success" : ""}`}
          >
            {!loginSuccess ? (
              <>
                <div className="login-header">
                  <h2>Login to TaskFlow</h2>
                  <p>Sign in with your email and OTP</p>
                </div>

                {step === 1 && (
                  <div className="info-banner">
                    <span className="info-icon">ℹ️</span>
                    <span>
                      Enter your registered email and select your role
                    </span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="login-form">
                  {/* Step 1: Email & Role */}
                  <div className={`form-step ${step === 1 ? "active" : ""}`}>
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        <span className="label-icon">📧</span>
                        Email Address
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={handleEmailChange}
                          placeholder="your@email.com"
                          className="form-input"
                          disabled={step === 2}
                          required
                          autoFocus
                        />
                        <span className="input-icon">✉️</span>
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">👤</span>
                        Select Your Role
                      </label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: "12px",
                          marginTop: "8px",
                        }}
                      >
                        {/* Staff */}
                        <button
                          type="button"
                          onClick={() => setSelectedRole("staff")}
                          disabled={step === 2}
                          style={{
                            padding: "12px",
                            border:
                              selectedRole === "staff"
                                ? "2px solid #667eea"
                                : "1px solid #ddd",
                            borderRadius: "8px",
                            background:
                              selectedRole === "staff" ? "#F0F4FF" : "white",
                            cursor: step === 2 ? "not-allowed" : "pointer",
                            transition: "all 0.3s ease",
                            fontWeight:
                              selectedRole === "staff" ? "600" : "500",
                            color:
                              selectedRole === "staff" ? "#667eea" : "#666",
                            opacity: step === 2 ? 0.6 : 1,
                          }}
                        >
                          👤 Staff
                        </button>

                        {/* Admin */}
                        <button
                          type="button"
                          onClick={() => setSelectedRole("admin")}
                          disabled={step === 2}
                          style={{
                            padding: "12px",
                            border:
                              selectedRole === "admin"
                                ? "2px solid #FF9800"
                                : "1px solid #ddd",
                            borderRadius: "8px",
                            background:
                              selectedRole === "admin" ? "#FFF8F0" : "white",
                            cursor: step === 2 ? "not-allowed" : "pointer",
                            transition: "all 0.3s ease",
                            fontWeight:
                              selectedRole === "admin" ? "600" : "500",
                            color:
                              selectedRole === "admin" ? "#FF9800" : "#666",
                            opacity: step === 2 ? 0.6 : 1,
                          }}
                        >
                          📋 Admin
                        </button>

                        {/* Superadmin */}
                        <button
                          type="button"
                          onClick={() => setSelectedRole("superadmin")}
                          disabled={step === 2}
                          style={{
                            padding: "12px",
                            border:
                              selectedRole === "superadmin"
                                ? "2px solid #DC143C"
                                : "1px solid #ddd",
                            borderRadius: "8px",
                            background:
                              selectedRole === "superadmin"
                                ? "#FFE0E6"
                                : "white",
                            cursor: step === 2 ? "not-allowed" : "pointer",
                            transition: "all 0.3s ease",
                            fontWeight:
                              selectedRole === "superadmin" ? "600" : "500",
                            color:
                              selectedRole === "superadmin"
                                ? "#DC143C"
                                : "#666",
                            opacity: step === 2 ? 0.6 : 1,
                          }}
                        >
                          👑 Superadmin
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={generateOtp}
                      disabled={isLoading || !email || step === 2}
                      className={`btn-generate ${isLoading ? "loading" : ""}`}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner"></span>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <span className="btn-icon">🔐</span>
                          Generate OTP
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step 2: OTP */}
                  {step === 2 && (
                    <div className="form-step active">
                      <div className="form-group">
                        <label htmlFor="otp" className="form-label">
                          <span className="label-icon">🔑</span>
                          Enter OTP Code
                        </label>
                        <div className="input-wrapper">
                          <input
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={handleOtpChange}
                            placeholder="000000"
                            className="form-input otp-input"
                            maxLength={6}
                            inputMode="numeric"
                            required
                            autoFocus
                          />
                          <span className="input-icon">🔓</span>
                        </div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginTop: "8px",
                          }}
                        >
                          Enter the 6-digit OTP provided when your account was
                          created
                        </p>
                      </div>

                      {otpError && (
                        <div className="error-message-box">
                          <span className="error-icon">✕</span>
                          <span>{otpError}</span>
                        </div>
                      )}

                      <div
                        style={{
                          background: "#F5F5F5",
                          padding: "12px",
                          borderRadius: "6px",
                          marginBottom: "16px",
                          fontSize: "13px",
                        }}
                      >
                        <strong>Logging in as:</strong>{" "}
                        {selectedRole === "superadmin"
                          ? "👑 Superadmin"
                          : selectedRole === "admin"
                          ? "📋 Admin"
                          : "👤 Staff"}
                      </div>

                      <button
                        type="submit"
                        disabled={!otp || otp.length < 6 || isLoading}
                        className="btn-login"
                      >
                        <span className="btn-icon">→</span>
                        {isLoading ? "Logging in..." : "Login Now"}
                      </button>

                      <button
                        type="button"
                        onClick={resetForm}
                        className="btn-back-to-email"
                      >
                        ← Use Different Email
                      </button>
                    </div>
                  )}

                  {otpError && step === 1 && (
                    <div className="error-message-box">
                      <span className="error-icon">✕</span>
                      <span>{otpError}</span>
                    </div>
                  )}
                </form>

                <div className="login-footer">
                  <p className="footer-text">
                    Don't have an account? Contact your Superadmin to create
                    one.
                  </p>
                </div>
              </>
            ) : (
              <div className="success-state">
                <div className="success-animation">
                  <div className="checkmark">✓</div>
                </div>
                <h2>Login Successful!</h2>
                <p>Welcome back!</p>
                <p>
                  Role:{" "}
                  {selectedRole === "superadmin"
                    ? "👑 Superadmin"
                    : selectedRole === "admin"
                    ? "📋 Admin"
                    : "👤 Staff"}
                </p>
                <p className="redirect-text">Redirecting to dashboard...</p>
                <div className="loading-bar">
                  <div className="loading-progress"></div>
                </div>
              </div>
            )}
          </div>

          <div className="login-divider">
            <span className="divider-text">
              Secure Email-Based Authentication
            </span>
          </div>
        </div>
      </div>

      <div className="floating-element floating-1">💼</div>
      <div className="floating-element floating-2">📊</div>
      <div className="floating-element floating-3">✅</div>
    </div>
  );
};

export default Login;
