// src/components/ProjectManagement.tsx
import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";

export const ProjectManagement: React.FC = () => {
  const { projects, addProject, deleteProject, tasks } = useUser();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  });

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      alert("Please enter a project name");
      return;
    }

    addProject(newProject);
    setNewProject({ name: "", description: "", color: "#3B82F6" });
    setShowAddForm(false);
  };

  const handleDeleteProject = (projectId: string) => {
    const tasksInProject = tasks.filter((task) => task.projectId === projectId);
    const confirmMessage =
      tasksInProject.length > 0
        ? `This project has ${tasksInProject.length} task(s). Deleting it will unassign these tasks from the project. Continue?`
        : "Are you sure you want to delete this project?";

    if (window.confirm(confirmMessage)) {
      deleteProject(projectId);
    }
  };

  const getTaskCount = (projectId: string) => {
    return tasks.filter((task) => task.projectId === projectId).length;
  };

  const colorOptions = [
    { value: "#3B82F6", name: "Blue" },
    { value: "#8B5CF6", name: "Purple" },
    { value: "#EC4899", name: "Pink" },
    { value: "#10B981", name: "Green" },
    { value: "#F59E0B", name: "Amber" },
    { value: "#EF4444", name: "Red" },
    { value: "#6366F1", name: "Indigo" },
    { value: "#14B8A6", name: "Teal" },
    { value: "#F97316", name: "Orange" },
    { value: "#06B6D4", name: "Cyan" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Project Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? "Cancel" : "+ Add New Project"}
        </button>
      </div>

      {/* Add Project Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Project</h3>
          <form onSubmit={handleAddProject} className="space-y-4">
            <div>
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Project Name *
              </label>
              <input
                type="text"
                id="projectName"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="projectDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <input
                type="text"
                id="projectDescription"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project description"
              />
            </div>

            <div>
              <label
                htmlFor="projectColor"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Color
              </label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setNewProject({ ...newProject, color: color.value })
                    }
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      newProject.color === color.value
                        ? "border-gray-800 scale-110"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Project
            </button>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <h3 className="font-semibold text-gray-800 text-lg">
                  {project.name}
                </h3>
              </div>
              <button
                onClick={() => handleDeleteProject(project.id)}
                className="text-red-500 hover:text-red-700 transition-colors ml-2"
                title="Delete project"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            {project.description && (
              <p className="text-gray-600 text-sm mb-3">
                {project.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                {getTaskCount(project.id)} task(s)
              </span>
              <span className="text-xs text-gray-400">ID: {project.id}</span>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-lg">No projects yet</p>
          <p className="text-sm mt-1">
            Click "Add New Project" to create your first project
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
