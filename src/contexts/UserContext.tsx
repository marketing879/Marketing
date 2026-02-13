import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

// ==================== SUPERADMIN INITIALIZATION ====================
// This creates a default superadmin account on first load
const initializeSuperadmin = () => {
  const userCredentials = JSON.parse(
    localStorage.getItem("userCredentials") || "[]"
  );

  // Check if superadmin already exists
  const superadminExists = userCredentials.some(
    (u: any) => u.systemRole === "superadmin"
  );

  if (!superadminExists) {
    // ⬇️ CHANGE THESE VALUES TO YOUR SUPERADMIN DETAILS
    const defaultSuperadmin = {
      userId: "SPA-ADMIN-0001",
      email: "pushkaraj.gore@roswalt.com", // ⬅️ CHANGE THIS EMAIL
      otp: "123456", // ⬅️ CHANGE THIS OTP
      systemRole: "superadmin",
      name: "System Administrator", // ⬅️ CHANGE THIS NAME
    };

    userCredentials.push(defaultSuperadmin);
    localStorage.setItem("userCredentials", JSON.stringify(userCredentials));

    console.log("========================================");
    console.log("✓ DEFAULT SUPERADMIN CREATED");
    console.log("========================================");
    console.log("Email:", defaultSuperadmin.email);
    console.log("OTP:", defaultSuperadmin.otp);
    console.log("Role: Superadmin");
    console.log("========================================");
    console.log("⚠️  Please login and change these credentials!");
    console.log("========================================");
  }
};

// ==================== INTERFACES ====================

export interface Project {
  id: string;
  name: string;
  description: string;
  color?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "on-hold";
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdAt: string;
  assignedTo: string;
  assignedBy: string;
  projectId?: string;
  approvalStatus:
    | "assigned"
    | "in-review"
    | "admin-approved"
    | "superadmin-approved"
    | "rejected";
  completionNotes?: string;
  adminReviewedBy?: string;
  adminReviewedAt?: string;
  adminComments?: string;
  superadminReviewedBy?: string;
  superadminReviewedAt?: string;
  superadminComments?: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: "staff" | "admin" | "superadmin";
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isActive?: boolean;
}

interface UserContextType {
  user: User | null;
  tasks: Task[];
  teamMembers: TeamMember[];
  projects: Project[];
  isAuthenticated: boolean;
  addTask: (
    task: Omit<Task, "id" | "createdAt" | "approvalStatus" | "assignedBy">
  ) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  submitTaskCompletion: (taskId: string, completionNotes: string) => void;
  getTaskById: (id: string) => Task | undefined;
  getTasksByAssignee: (email: string) => Task[];
  getAssignedTasks: () => Task[];
  getTasksForAdminReview: () => Task[];
  getTasksForSuperadminApproval: () => Task[];
  getProjectById: (id: string) => Project | undefined;
  addProject: (project: Omit<Project, "id">) => void;
  deleteProject: (id: string) => void;
  addTeamMember: (member: Omit<TeamMember, "id">) => void;
  deleteTeamMember: (id: string) => void;
  getTeamMemberByEmail: (email: string) => TeamMember | undefined;
  login: (userData: {
    name: string;
    email: string;
    role?: "staff" | "admin" | "superadmin";
  }) => void;
  logout: () => void;
  adminReviewTask: (
    taskId: string,
    approved: boolean,
    comments?: string
  ) => void;
  superadminApproveTask: (
    taskId: string,
    approved: boolean,
    comments?: string
  ) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// ==================== USER PROVIDER ====================

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Initialize superadmin on mount
  useEffect(() => {
    initializeSuperadmin();
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const authStatus = localStorage.getItem("isAuthenticated");
      const userData = localStorage.getItem("user");
      const isAuth = authStatus === "true" && userData !== null;
      if (isAuth) console.log("✓ User authenticated from localStorage");
      return isAuth;
    } catch (error) {
      console.error("❌ Error reading auth:", error);
      return false;
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as User;
        if (parsedUser.name && parsedUser.email) {
          console.log(
            "✓ User loaded:",
            parsedUser.name,
            `(${parsedUser.role})`
          );
          return parsedUser;
        }
      }
    } catch (error) {
      console.error("❌ Error loading user:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
    }
    return null;
  });

  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "Roswalt Zaiden",
      description: "Roswalt Zaiden project",
      color: "#3B82F6",
    },
    {
      id: "2",
      name: "Roswalt Zyon",
      description: "Roswalt Zyon project",
      color: "#8B5CF6",
    },
    {
      id: "3",
      name: "Roswalt Zeya",
      description: "Roswalt Zeya project",
      color: "#EC4899",
    },
    {
      id: "4",
      name: "Shata-tarakha",
      description: "Shata-tarakha project",
      color: "#10B981",
    },
  ]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Prathamesh Vijay Chile",
      email: "prathamesh@company.com",
      role: "Graphic Designer",
      isActive: true,
    },
    {
      id: "2",
      name: "Samruddhi Shivgan",
      email: "samruddhi@company.com",
      role: "Senior Graphic Designer",
      isActive: true,
    },
    {
      id: "3",
      name: "Vishal Chaudhary",
      email: "vishal@company.com",
      role: "Video Editor",
      isActive: true,
    },
    {
      id: "4",
      name: "Mithilesh Vinay Menge",
      email: "mithilesh@company.com",
      role: "Video Editor",
      isActive: true,
    },
    {
      id: "5",
      name: "Jai Bhojwani",
      email: "jai@company.com",
      role: "Graphic Designer",
      isActive: true,
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Design UI Mockups",
      description: "Create UI mockups for the new dashboard",
      status: "in-progress",
      priority: "high",
      dueDate: "2026-02-20",
      createdAt: "2026-02-10",
      assignedTo: "prathamesh@company.com",
      assignedBy: "admin@company.com",
      projectId: "1",
      approvalStatus: "assigned",
    },
    {
      id: "2",
      title: "Edit Product Video",
      description: "Edit and finalize the product promotional video",
      status: "pending",
      priority: "medium",
      dueDate: "2026-02-18",
      createdAt: "2026-02-11",
      assignedTo: "vishal@company.com",
      assignedBy: "admin@company.com",
      projectId: "2",
      approvalStatus: "assigned",
    },
  ]);

  // ===== STAFF METHODS =====

  const submitTaskCompletion = (taskId: string, completionNotes: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (task.assignedTo !== user?.email) {
      console.error("❌ Cannot submit task not assigned to you");
      return;
    }

    updateTask(taskId, {
      status: "completed",
      approvalStatus: "in-review",
      completionNotes: completionNotes,
    });
    console.log(`✓ Task ${taskId} marked as complete, sent for admin review`);
  };

  // ===== ADMIN METHODS =====

  const addTask = (
    task: Omit<Task, "id" | "createdAt" | "approvalStatus" | "assignedBy">
  ) => {
    if (user?.role !== "admin" && user?.role !== "superadmin") {
      console.error("❌ Only admins can create tasks");
      return;
    }

    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
      approvalStatus: "assigned",
      assignedBy: user.email,
    };
    setTasks([...tasks, newTask]);
    console.log(`✓ Task created and assigned to ${task.assignedTo}`);
  };

  const adminReviewTask = (
    taskId: string,
    approved: boolean,
    comments?: string
  ) => {
    if (user?.role !== "admin") {
      console.error("❌ Only admins can review tasks");
      return;
    }

    updateTask(taskId, {
      approvalStatus: approved ? "admin-approved" : "rejected",
      adminReviewedBy: user.name,
      adminReviewedAt: new Date().toISOString().split("T")[0],
      adminComments: comments,
    });
    console.log(
      `✓ Task ${taskId} ${approved ? "approved" : "rejected"} by admin`
    );
  };

  // ===== SUPERADMIN METHODS =====

  const superadminApproveTask = (
    taskId: string,
    approved: boolean,
    comments?: string
  ) => {
    if (user?.role !== "superadmin") {
      console.error("❌ Only superadmin can approve tasks");
      return;
    }

    updateTask(taskId, {
      approvalStatus: approved ? "superadmin-approved" : "rejected",
      superadminReviewedBy: user.name,
      superadminReviewedAt: new Date().toISOString().split("T")[0],
      superadminComments: comments,
    });
    console.log(
      `✓ Task ${taskId} ${approved ? "approved" : "rejected"} by superadmin`
    );
  };

  // ===== TASK QUERIES =====

  const getTasksByAssignee = (email: string) => {
    return tasks.filter((task) => task.assignedTo === email);
  };

  const getAssignedTasks = () => {
    if (!user?.email) return [];
    return getTasksByAssignee(user.email);
  };

  const getTasksForAdminReview = () => {
    return tasks.filter((task) => task.approvalStatus === "in-review");
  };

  const getTasksForSuperadminApproval = () => {
    return tasks.filter((task) => task.approvalStatus === "admin-approved");
  };

  // ===== GENERIC TASK METHODS =====

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const getTaskById = (id: string) => {
    return tasks.find((task) => task.id === id);
  };

  // ===== PROJECT METHODS =====

  const getProjectById = (id: string) => {
    return projects.find((project) => project.id === id);
  };

  const addProject = (project: Omit<Project, "id">) => {
    // Not implemented for this demo
  };

  const deleteProject = (id: string) => {
    // Not implemented for this demo
  };

  // ===== TEAM MEMBER METHODS =====

  const addTeamMember = (member: Omit<TeamMember, "id">) => {
    const newMember: TeamMember = {
      ...member,
      id: Date.now().toString(),
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const deleteTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== id));
  };

  const getTeamMemberByEmail = (email: string) => {
    return teamMembers.find((member) => member.email === email);
  };

  // ===== AUTH METHODS =====

  const login = (userData: {
    name: string;
    email: string;
    role?: "staff" | "admin" | "superadmin";
  }) => {
    try {
      if (!userData || !userData.name || !userData.email) {
        throw new Error("Invalid user data");
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        role: userData.role || "staff",
      };

      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("isAuthenticated", "true");

      setUser(newUser);
      setIsAuthenticated(true);

      console.log("✓ Login successful:", newUser.name, `(${newUser.role})`);
    } catch (error) {
      console.error("❌ Login failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      throw error;
    }
  };

  const logout = () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
      console.log("✓ Logout successful");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        tasks,
        teamMembers,
        projects,
        isAuthenticated,
        addTask,
        updateTask,
        deleteTask,
        submitTaskCompletion,
        getTaskById,
        getTasksByAssignee,
        getAssignedTasks,
        getTasksForAdminReview,
        getTasksForSuperadminApproval,
        getProjectById,
        addProject,
        deleteProject,
        addTeamMember,
        deleteTeamMember,
        getTeamMemberByEmail,
        login,
        logout,
        adminReviewTask,
        superadminApproveTask,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
