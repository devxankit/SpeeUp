import { useState, useEffect } from "react";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  type Role,
  type CreateRoleData,
  type UpdateRoleData,
} from "../../../services/api/admin/adminRoleService";
import { useAuth } from "../../../context/AuthContext";

export default function AdminManageRoles() {
  const { isAuthenticated, token } = useAuth();
  const [roleName, setRoleName] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch roles on component mount
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getRoles({
          search: searchTerm,
          page: currentPage,
          limit: entriesPerPage,
          sortBy: sortColumn || undefined,
          sortOrder: sortDirection,
        });

        if (response.success) {
          setRoles(response.data);
        } else {
          setError("Failed to load roles");
        }
      } catch (err: any) {
        console.error("Error fetching roles:", err);
        setError(
          err.response?.data?.message ||
          "Failed to load roles. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [
    isAuthenticated,
    token,
    searchTerm,
    currentPage,
    entriesPerPage,
    sortColumn,
    sortDirection,
  ]);

  const handleAddRole = async () => {
    if (!roleName.trim()) {
      alert("Please enter a role name");
      return;
    }

    try {
      setSubmitting(true);

      if (editingId !== null) {
        // Update existing role
        const updateData: UpdateRoleData = {
          name: roleName.trim(),
        };

        const response = await updateRole(editingId, updateData);

        if (response.success) {
          // Update local state
          setRoles((prev) =>
            prev.map((role) =>
              role._id === editingId ? { ...role, name: roleName.trim() } : role
            )
          );
          alert("Role updated successfully!");
          setEditingId(null);
        } else {
          alert(
            "Failed to update role: " + (response.message || "Unknown error")
          );
        }
      } else {
        // Add new role
        const roleData: CreateRoleData = {
          name: roleName.trim(),
        };

        const response = await createRole(roleData);

        if (response.success) {
          // Add to local state
          setRoles((prev) => [...prev, response.data]);
          alert("Role added successfully!");
        } else {
          alert("Failed to add role: " + (response.message || "Unknown error"));
        }
      }

      // Reset form
      setRoleName("");
    } catch (err: any) {
      console.error("Error saving role:", err);
      alert(
        "Failed to save role: " +
        (err.response?.data?.message || "Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id: string) => {
    const role = roles.find((r) => r._id === id);
    if (role && role.type === "Custom") {
      setRoleName(role.name);
      setEditingId(id);
    }
  };

  const handleDelete = async (id: string) => {
    const role = roles.find((r) => r._id === id);
    if (role && role.type === "Custom") {
      if (
        !window.confirm(
          `Are you sure you want to delete the role "${role.name}"?`
        )
      ) {
        return;
      }

      try {
        setSubmitting(true);
        const response = await deleteRole(id);

        if (response.success) {
          // Remove from local state
          setRoles((prev) => prev.filter((r) => r._id !== id));
          alert("Role deleted successfully!");
        } else {
          alert(
            "Failed to delete role: " + (response.message || "Unknown error")
          );
        }
      } catch (err: any) {
        console.error("Error deleting role:", err);
        alert(
          "Failed to delete role: " +
          (err.response?.data?.message || "Please try again.")
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setRoleName("");
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["#", "Role", "Type"],
      ...roles.map((role) => [role._id.toString(), role.name, role.type]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "roles.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Note: Filtering and sorting is done server-side, so we just use the roles as is
  const displayedRoles = roles;

  // For pagination display (simplified - in real app, this would come from API)
  const totalPages = Math.ceil(displayedRoles.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return (
        <span className="inline-block ml-1">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 4.5L6 1.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 7.5L6 10.5L9 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );
    }
    return (
      <span className="inline-block ml-1">
        {sortDirection === "asc" ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 4.5L6 1.5L9 4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 7.5L6 10.5L9 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Page Header */}
      <div className="p-6 pb-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-neutral-800">
            Manage Roles
          </h1>
          <div className="text-sm text-blue-500">
            <span className="text-blue-500 hover:underline cursor-pointer">
              Home
            </span>{" "}
            <span className="text-neutral-400">/</span> Dashboard
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left Panel: Add Roles */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 flex flex-col">
            <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-lg font-semibold">Add Roles</h2>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Enter Role
                  </label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="Enter Role"
                    className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="mt-auto pt-4">
                {editingId !== null ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddRole}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded text-sm font-medium transition-colors">
                      Update Role
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2.5 rounded text-sm font-medium transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddRole}
                    disabled={submitting}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white py-2.5 rounded text-sm font-medium transition-colors flex items-center justify-center">
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingId ? "Updating..." : "Adding..."}
                      </>
                    ) : editingId ? (
                      "Update Role"
                    ) : (
                      "Add Roles"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: View Roles */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 flex flex-col">
            <div className="bg-white px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-800">
                View Roles
              </h2>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-700">Show</span>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-neutral-700">entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExport}
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1.5">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"></path>
                      <path d="M7 10L12 15L17 10"></path>
                      <path d="M12 15V3"></path>
                    </svg>
                    Export
                  </button>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search:"
                    className="px-3 py-1.5 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200">
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100"
                        onClick={() => handleSort("id")}>
                        <div className="flex items-center">
                          #
                          <SortIcon column="id" />
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100"
                        onClick={() => handleSort("name")}>
                        <div className="flex items-center">
                          Role
                          <SortIcon column="name" />
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100"
                        onClick={() => handleSort("type")}>
                        <div className="flex items-center">
                          Type
                          <SortIcon column="type" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mr-2"></div>
                            Loading roles...
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-red-600">
                          {error}
                        </td>
                      </tr>
                    ) : displayedRoles.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-sm text-neutral-500">
                          No roles found
                        </td>
                      </tr>
                    ) : (
                      displayedRoles.map((role) => (
                        <tr
                          key={role._id}
                          className="border-b border-neutral-200 hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {role._id.slice(-6)}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {role.name}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${role.type === "System"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}>
                              {role.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {role.type === "Custom" ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEdit(role._id)}
                                  disabled={submitting}
                                  className="p-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white rounded transition-colors"
                                  title="Edit">
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"></path>
                                    <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"></path>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(role._id)}
                                  disabled={submitting}
                                  className="p-1.5 bg-red-500 hover:bg-red-600 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white rounded transition-colors"
                                  title="Delete">
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <path d="M3 6H5H21"></path>
                                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"></path>
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-neutral-400">
                                -
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-neutral-200">
                <div className="text-sm text-neutral-600">
                  Showing {displayedRoles.length > 0 ? startIndex + 1 : 0} to{" "}
                  {Math.min(endIndex, displayedRoles.length)} of{" "}
                  {displayedRoles.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-neutral-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M15 18L9 12L15 6"></path>
                    </svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 border rounded text-sm transition-colors ${currentPage === page
                          ? "bg-teal-600 text-white border-teal-600"
                          : "border-neutral-300 hover:bg-neutral-50"
                          }`}>
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-neutral-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M9 18L15 12L9 6"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-neutral-500 py-4 px-6">
        Copyright © 2025. Developed By{" "}
        <a href="#" className="text-teal-600 hover:text-teal-700">
          SpeeUp - 10 Minute App
        </a>
      </div>
    </div>
  );
}
