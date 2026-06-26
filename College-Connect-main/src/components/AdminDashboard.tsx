import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/apiConfig";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  Search,
  Filter,
  Download,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Activity,
  BookOpen,
  Calendar,
  BarChart3,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  studentIdUrl: string;
  createdAt: string;
  role: string;
  verificationStatus: string;
  admissionYear?: number;
  college?: string;
  currentYear?: number;
  course?: string;
  branch?: string;
  graduationYear?: number;
  personalEmail?: string;
}

interface Stats {
  totalUsers: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  recentRegistrations: number;
  todayRegistrations?: number;
  weeklyGrowth?: number;
}

interface AnalyticsData {
  userGrowth: { date: string; count: number }[];
  departmentStats: { department: string; count: number }[];
  hackathonParticipation: { month: string; participants: number }[];
  resourceDownloads: { date: string; downloads: number }[];
  peakHours: { hour: number; activity: number }[];
  totalResources?: number;
  totalHackathons?: number;
  totalDownloads?: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  bgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  color,
  bgColor,
  trend,
  subtitle,
}) => (
  <div
    className={`${bgColor} rounded-xl shadow-lg p-6 relative overflow-hidden transition-transform hover:-translate-y-1`}
  >
    <div className="absolute top-0 right-0 opacity-10">
      <div className={`${color} w-32 h-32 rounded-full -mr-8 -mt-8`}></div>
    </div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp
              className={`h-4 w-4 ${!trend.isPositive && "rotate-180"}`}
            />
            {trend.value}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-4xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCollege, setFilterCollege] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [timeRange, setTimeRange] = useState("30");

  const API_URL = API_BASE_URL;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (showAnalytics) {
      fetchAnalytics();
    }
  }, [showAnalytics, timeRange]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterCollege, pendingUsers]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/pending-users`, { withCredentials: true }),
        axios.get(`${API_URL}/admin/stats`, { withCredentials: true }),
      ]);

      setPendingUsers(pendingRes.data.users || []);
      setFilteredUsers(pendingRes.data.users || []);
      setStats(statsRes.data.stats || null);
    } catch (error: any) {
      console.error("Fetch error:", error);
      const errorMsg =
        error.response?.data?.error || error.message || "Failed to load data";
      alert(`❌ Error: ${errorMsg}`);

      setPendingUsers([]);
      setFilteredUsers([]);
      setStats({
        totalUsers: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        recentRegistrations: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/admin/analytics?days=${timeRange}`,
        { withCredentials: true }
      );

      if (res.data.success && res.data.analytics) {
        setAnalytics(res.data.analytics);
      }
    } catch (error: any) {
      console.error("Analytics fetch error:", error);
    }
  };

  const filterUsers = () => {
    let filtered = [...pendingUsers];

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCollege !== "all") {
      filtered = filtered.filter((user) => user.college === filterCollege);
    }

    setFilteredUsers(filtered);
  };

  const handleApprove = async (userId: string) => {
    if (!window.confirm("Are you sure you want to approve this user?")) return;

    setActionLoading(true);
    try {
      await axios.post(
        `${API_URL}/admin/approve/${userId}`,
        {},
        { withCredentials: true }
      );

      alert("✅ User approved successfully!");
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      console.error("Approve error:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to approve user";
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId: string) => {
    if (!rejectionReason.trim()) {
      alert("❌ Please provide a rejection reason");
      return;
    }

    if (!window.confirm("Are you sure you want to reject this user?")) return;

    setActionLoading(true);
    try {
      await axios.post(
        `${API_URL}/admin/reject/${userId}`,
        { reason: rejectionReason },
        { withCredentials: true }
      );

      alert("✅ User rejected successfully");
      setShowModal(false);
      setRejectionReason("");
      fetchData();
    } catch (error: any) {
      console.error("Reject error:", error);
      const errorMsg =
        error.response?.data?.error || error.message || "Failed to reject user";
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const viewUser = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
    setRejectionReason("");
  };

  const exportToCSV = () => {
    if (pendingUsers.length === 0) {
      alert("❌ No data to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Role",
      "College",
      "Course",
      "Branch",
      "Year",
      "Registered Date",
    ];
    const rows = pendingUsers.map((user) => [
      user.name,
      user.email,
      user.role || "N/A",
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

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pending_users_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    alert("✅ CSV downloaded successfully!");
  };

  const getUniqueColleges = () => {
    const colleges = pendingUsers
      .map((user) => user.college)
      .filter((college) => college && college.trim() !== "");
    return [...new Set(colleges)];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 animate-pulse font-medium">
          Loading dashboard...
        </p>
      </div>
    );
  }

  // Analytics Charts Data
  const maxGrowth = analytics
    ? Math.max(...analytics.userGrowth.map((d) => d.count), 1)
    : 1;
  const maxParticipation = analytics
    ? Math.max(...analytics.hackathonParticipation.map((h) => h.participants), 1)
    : 1;
  const totalDepartmentUsers = analytics
    ? analytics.departmentStats.reduce((sum, d) => sum + d.count, 0) || 1
    : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage user verifications and platform statistics
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all ${
                showAnalytics
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white border-gray-300 hover:bg-gray-50"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              {showAnalytics ? "Hide Analytics" : "Show Analytics"}
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              title="Total Users"
              value={stats.totalUsers}
              color="bg-blue-500"
              bgColor="bg-blue-50"
              trend={
                stats.weeklyGrowth
                  ? { value: stats.weeklyGrowth, isPositive: true }
                  : undefined
              }
              subtitle={
                stats.todayRegistrations
                  ? `+${stats.todayRegistrations} today`
                  : undefined
              }
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              title="Pending"
              value={stats.pendingCount}
              color="bg-yellow-500"
              bgColor="bg-yellow-50"
            />
            <StatCard
              icon={<CheckCircle className="w-6 h-6" />}
              color="bg-green-500"
              bgColor="bg-green-50"
              title="Approved"
              value={stats.approvedCount}
            />
            <StatCard
              icon={<XCircle className="w-6 h-6" />}
              color="bg-red-500"
              bgColor="bg-red-50"
              title="Rejected"
              value={stats.rejectedCount}
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              color="bg-purple-500"
              bgColor="bg-purple-50"
              title="This Week"
              value={stats.recentRegistrations}
            />
          </div>
        )}

        {/* Analytics Section */}
        {showAnalytics && analytics && (
          <div className="space-y-6">
            {/* Analytics Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Platform Analytics
              </h2>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>

            {/* Additional KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analytics.totalResources !== undefined && (
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                  <BookOpen className="h-8 w-8 opacity-80 mb-2" />
                  <div className="text-3xl font-bold mb-1">
                    {analytics.totalResources}
                  </div>
                  <div className="text-green-100 text-sm">Total Resources</div>
                </div>
              )}

              {analytics.totalHackathons !== undefined && (
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                  <Calendar className="h-8 w-8 opacity-80 mb-2" />
                  <div className="text-3xl font-bold mb-1">
                    {analytics.totalHackathons}
                  </div>
                  <div className="text-purple-100 text-sm">Active Hackathons</div>
                </div>
              )}

              {analytics.totalDownloads !== undefined && (
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                  <Download className="h-8 w-8 opacity-80 mb-2" />
                  <div className="text-3xl font-bold mb-1">
                    {analytics.totalDownloads}
                  </div>
                  <div className="text-orange-100 text-sm">Total Downloads</div>
                </div>
              )}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      User Growth
                    </h3>
                    <p className="text-sm text-gray-600">
                      New registrations over time
                    </p>
                  </div>
                  <Activity className="h-5 w-5 text-indigo-600" />
                </div>
                {analytics.userGrowth.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.userGrowth.slice(-10).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 w-16">
                          {new Date(item.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all"
                            style={{ width: `${(item.count / maxGrowth) * 100}%` }}
                          />
                        </div>
                        <div className="text-sm font-semibold text-gray-700 w-8 text-right">
                          {item.count}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No growth data available
                  </div>
                )}
              </div>

              {/* Department Distribution */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Department Distribution
                    </h3>
                    <p className="text-sm text-gray-600">
                      Students by department
                    </p>
                  </div>
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                {analytics.departmentStats.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.departmentStats.map((dept, idx) => {
                      const percentage = (
                        (dept.count / totalDepartmentUsers) *
                        100
                      ).toFixed(1);
                      const colors = [
                        "bg-blue-500",
                        "bg-green-500",
                        "bg-purple-500",
                        "bg-orange-500",
                        "bg-pink-500",
                      ];
                      return (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {dept.department}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {dept.count}{" "}
                              <span className="text-gray-500">
                                ({percentage}%)
                              </span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${
                                colors[idx % colors.length]
                              } h-full rounded-full transition-all`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No department data available
                  </div>
                )}
              </div>
            </div>

            {/* Hackathon Participation */}
            {analytics.hackathonParticipation.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Hackathon Participation
                    </h3>
                    <p className="text-sm text-gray-600">
                      Monthly participation trends
                    </p>
                  </div>
                  <Calendar className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex items-end justify-between gap-4 h-48">
                  {analytics.hackathonParticipation.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="relative flex-1 w-full flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all hover:from-purple-600 hover:to-purple-500 cursor-pointer group"
                          style={{
                            height: `${
                              (item.participants / maxParticipation) * 100
                            }%`,
                          }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {item.participants} participants
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pending Verifications Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Pending Verifications
                  <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    {filteredUsers.length}
                  </span>
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Review and approve student registrations
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    showFilters
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                <button
                  onClick={exportToCSV}
                  disabled={pendingUsers.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Search & Filter Panel */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <select
                  title="college filter"
                  value={filterCollege}
                  onChange={(e) => setFilterCollege(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Colleges</option>
                  {getUniqueColleges().map((college) => (
                    <option key={college} value={college}>
                      {college}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Table Content */}
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              {pendingUsers.length === 0 ? (
                <>
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    All Caught Up! 🎉
                  </h3>
                  <p className="text-gray-600">
                    No pending verifications at the moment.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No Results Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterCollege("all");
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        College
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Course/Branch
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-semibold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="font-semibold text-gray-900">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {user.email}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {user.college || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="text-gray-900">
                              {user.course || "N/A"}
                            </div>
                            <div className="text-gray-500">
                              {user.branch || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => viewUser(user)}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {user.name}
                          </h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">College:</span>
                        <span className="text-gray-900 font-medium">
                          {user.college || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Course:</span>
                        <span className="text-gray-900 font-medium">
                          {user.course || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Registered:</span>
                        <span className="text-gray-900 font-medium">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => viewUser(user)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Review Application
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={() => !actionLoading && setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Student Verification
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Review application details carefully
                </p>
              </div>
              <button
                onClick={() => !actionLoading && setShowModal(false)}
                disabled={actionLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Student Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Name", value: selectedUser.name },
                    { label: "Email", value: selectedUser.email },
                    { label: "Role", value: selectedUser.role || "N/A" },
                    { label: "College", value: selectedUser.college || "N/A" },
                    { label: "Course", value: selectedUser.course || "N/A" },
                    { label: "Branch", value: selectedUser.branch || "N/A" },
                    {
                      label: "Admission Year",
                      value: selectedUser.admissionYear || "N/A",
                    },
                    {
                      label: "Current Year",
                      value: selectedUser.currentYear || "N/A",
                    },
                    {
                      label: "Expected Graduation",
                      value: selectedUser.graduationYear || "N/A",
                    },
                    {
                      label: "Registration Date",
                      value: new Date(
                        selectedUser.createdAt
                      ).toLocaleDateString(),
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        {item.label}
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student ID Card */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-indigo-600" />
                  Student ID Card
                </h4>
                {selectedUser.studentIdUrl ? (
                  selectedUser.studentIdUrl.toLowerCase().endsWith(".pdf") ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                      <div className="text-red-600 mb-4">
                        <svg
                          className="w-16 h-16 mx-auto"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                        </svg>
                      </div>
                      <p className="text-gray-700 font-medium mb-4">
                        PDF Document
                      </p>
                      <a
                        href={selectedUser.studentIdUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                      >
                        <Download className="h-5 w-5" />
                        Open PDF in New Tab
                      </a>
                    </div>
                  ) : (
                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-4">
                      <img
                        src={selectedUser.studentIdUrl}
                        alt="Student ID"
                        className="w-full rounded-lg shadow-lg"
                        loading="lazy"
                      />
                    </div>
                  )
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No ID uploaded</p>
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Rejection Reason (Required if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  rows={4}
                  placeholder="e.g., Invalid student ID, blurry image, incorrect information..."
                  disabled={actionLoading}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex flex-col sm:flex-row items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedUser._id)}
                disabled={actionLoading}
                className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    Reject
                  </>
                )}
              </button>
              <button
                onClick={() => handleApprove(selectedUser._id)}
                disabled={actionLoading}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Approve
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
