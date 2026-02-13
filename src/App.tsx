// src/App.tsx
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";
import Login from "./components/Login";
import StaffDashboard from "./components/StaffDashboard";
import AdminDashboard from "./components/AdminDashboard";
import SADashboard from "./components/SADashboard"; // CHANGED: was SuperadminDashboard
import AddNewUserForm from "./components/AddNewUserForm";

// Protected Route - All authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user } = useUser();

  if (!isAuthenticated || !user) {
    console.log("🔒 Access denied - redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Staff Route - Only staff members
const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useUser();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "staff") {
    console.log("❌ Staff access denied");
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
};

// Admin Route - Only admins
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useUser();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    console.log("❌ Admin access denied");
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
};

// Superadmin Route - Only superadmins
const SuperadminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user } = useUser();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "superadmin") {
    console.log("❌ Superadmin access denied");
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
};

// Get dashboard path based on role
function getRoleDashboardPath(role: string): string {
  switch (role) {
    case "superadmin":
      return "/superadmin";
    case "admin":
      return "/admin";
    case "staff":
    default:
      return "/";
  }
}

// App Routes
const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useUser();

  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="/login"
        element={
          isAuthenticated && user ? (
            <Navigate to={getRoleDashboardPath(user.role)} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Staff Dashboard */}
      <Route
        path="/"
        element={
          <StaffRoute>
            <StaffDashboard />
          </StaffRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Superadmin Dashboard - CHANGED: Now using SADashboard */}
      <Route
        path="/superadmin"
        element={
          <SuperadminRoute>
            <SADashboard />
          </SuperadminRoute>
        }
      />

      {/* ADD NEW USER ROUTE - Superadmin Only */}
      <Route
        path="/add-user"
        element={
          <SuperadminRoute>
            <AddNewUserForm
              onSuccess={() => (window.location.href = "/superadmin")}
              onCancel={() => (window.location.href = "/superadmin")}
            />
          </SuperadminRoute>
        }
      />

      {/* Catch all */}
      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated && user
                ? getRoleDashboardPath(user.role)
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
};

// App Content
const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useUser();

  useEffect(() => {
    console.log("🔐 Auth State Changed:");
    console.log("   isAuthenticated:", isAuthenticated);
    console.log(
      "   user:",
      user ? `${user.name} (${user.role}) - ${user.email}` : "null"
    );
  }, [isAuthenticated, user]);

  return (
    <div className="app">
      <AppRoutes />
    </div>
  );
};

// Main App
const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
};

export default App;
