import axios from "axios";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // 🆕 ADD THIS
import toast from "react-hot-toast";
import {
  Users,
  Search,
  Filter,
  Download,
  Trash2,
  Mail,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config/apiConfig";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  verificationStatus: string;
  college?: string;
  course?: string;
  branch?: string;
  admissionYear?: number;
  graduationYear?: number;
  currentYear?: number;
  createdAt: string;
  avatar?: string;
}

interface Filters {
  status: string;
  role: string;
  college: string;
  year: string;
  branch: string;
}

function AllUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    role: "all",
    college: "all",
    year: "all",
    branch: "all",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const API_URL = API_BASE_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/users`, {
        withCredentials: true,
      });
      setUsers(res.data.users || []);
    } catch (error: any) {
      console.error("Fetch users error:", error);
      toast.error(error.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    let filtered = [...users];

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(
        (u) => u.verificationStatus === filters.status
      );
    }

    if (filters.role !== "all") {
      filtered = filtered.filter((u) => u.role === filters.role);
    }

    if (filters.year !== "all") {
      filtered = filtered.filter(
        (u) => u.graduationYear?.toString() === filters.year
      );
    }

    if (filters.branch !== "all") {
      filtered = filtered.filter((u) => u.branch === filters.branch);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      role: "all",
      college: "all",
      year: "all",
      branch: "all",
    });
    setSearchQuery("");
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((u) => u._id));
    }
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(`Delete ${selectedUsers.length} users? This cannot be undone!`)
    )
      return;
    try {
      await Promise.all(
        selectedUsers.map((id) =>
          axios.delete(`${API_URL}/admin/users/${id}`, {
            withCredentials: true,
          })
        )
      );

      toast.success(`${selectedUsers.length} users deleted`);
      setSelectedUsers([]);
      fetchUsers();
    } catch {
      toast.error("Failed to delete users");
    }
  };

  const handleBulkEmail = () => {
    const emails = selectedUsers
      .map((id) => users.find((u) => u._id === id)?.email)
      .filter(Boolean)
      .join(",");

    window.location.href = `mailto:${emails}`;
    toast.success("Opening email client...");
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Role",
      "Status",
      "College",
      "Course",
      "Branch",
      "Year",
      "Joined",
    ];

    const rows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.role,
      user.verificationStatus,
      user.college || "N/A",
      user.course || "N/A",
      user.branch || "N/A",
      user.currentYear || "N/A",
      new Date(user.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("CSV downloaded!");
  };

  const getUniqueColleges = () => {
    return [...new Set(users.map((u) => u.college).filter(Boolean))];
  };

  const getUniqueYears = () => {
    return [
      ...new Set(users.map((u) => u.graduationYear).filter(Boolean)),
    ].sort();
  };

  const getUniqueBranches = () => {
    return [...new Set(users.map((u) => u.branch).filter(Boolean))].sort();
  };

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              All Users
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all registered users on the platform
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              disabled={filteredUsers.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-600">Total Users</div>
            <div className="text-2xl font-bold text-gray-900">
              {users.length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-600">Students</div>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter((u) => u.role === "student").length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-600">Seniors</div>
            <div className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.role === "senior").length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-600">Alumni</div>
            <div className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.role === "alumni").length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-600">Showing</div>
            <div className="text-2xl font-bold text-indigo-600">
              {filteredUsers.length}
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                showFilters
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t"
            >
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filters.role}
                onChange={(e) =>
                  setFilters({ ...filters, role: e.target.value })
                }
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="senior">Senior</option>
                <option value="alumni">Alumni</option>
              </select>

              <select
                value={filters.college}
                onChange={(e) =>
                  setFilters({ ...filters, college: e.target.value })
                }
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">All Colleges</option>
                {getUniqueColleges().map((college) => (
                  <option key={college} value={college}>
                    {college}
                  </option>
                ))}
              </select>

              <select
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: e.target.value })
                }
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">All Years</option>
                {getUniqueYears().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <select
                value={filters.branch}
                onChange={(e) =>
                  setFilters({ ...filters, branch: e.target.value })
                }
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">All Branches</option>
                {getUniqueBranches().map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>

              <button
                onClick={clearFilters}
                className="md:col-span-5 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between"
          >
            <span className="font-medium text-indigo-900">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkEmail}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-50 transition"
              >
                <Mail className="h-4 w-4" />
                Email All
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === paginatedUsers.length &&
                        paginatedUsers.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    College/Course
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleSelectUser(user._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.avatar ||
                            `https://ui-avatars.com/api/?name=${user.name}`
                          }
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === "student"
                            ? "bg-blue-100 text-blue-700"
                            : user.role === "senior"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "alumni"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user.verificationStatus)}
                        <span className="text-sm capitalize">
                          {user.verificationStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {user.college || "N/A"}
                        </div>
                        <div className="text-gray-500">
                          {user.course || user.branch || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* 🔥 FIXED: Using Link instead of window.open */}
                        <Link
                          to={`/profile/${user._id}`}
                          onClick={() => {
                            console.log("👁️ Eye clicked! User ID:", user._id);
                            console.log(
                              "Navigating to:",
                              `/profile/${user._id}`
                            );
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() =>
                            (window.location.href = `mailto:${user.email}`)
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Send Email"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                    )
                    .map((page, idx, arr) => (
                      <>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span
                            key={`dots-${page}`}
                            className="px-2 text-gray-400"
                          >
                            ...
                          </span>
                        )}
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition ${
                            currentPage === page
                              ? "bg-indigo-600 text-white"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      </>
                    ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Users Found
            </h3>
            <p className="text-gray-600 mb-4">
              {users.length === 0
                ? "No users have registered yet"
                : "Try adjusting your search or filters"}
            </p>
            {users.length > 0 && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllUsers;
