import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  Download,
  Clock,
  RefreshCw,
  Activity,
  AlertCircle,
} from "lucide-react";
import { API_BASE_URL } from "../config/apiConfig";

interface AnalyticsData {
  userGrowth: { date: string; count: number }[];
  departmentStats: { department: string; count: number }[];
  hackathonParticipation: { month: string; participants: number }[];
  resourceDownloads: { date: string; downloads: number }[];
  peakHours: { hour: number; activity: number }[];
  totalUsers: number;
  totalResources: number;
  totalHackathons: number;
  totalDownloads: number;
  todayRegistrations: number;
  weeklyGrowth: number;
}

const Analytics = () => {
  console.log("Analytics component mounted!");
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const API_URL = API_BASE_URL;
      const res = await fetch(`${API_URL}/admin/analytics?days=${timeRange}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      const result = await res.json();
      
      if (result.success && result.analytics) {
        setData(result.analytics);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      setError(err.message || "Failed to load analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Failed to Load Analytics
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Unable to fetch analytics data from the server"}
          </p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxGrowth = Math.max(...data.userGrowth.map((d) => d.count), 1);
  const maxDownloads = Math.max(...data.resourceDownloads.map((d) => d.downloads), 1);
  const maxActivity = Math.max(...data.peakHours.map((h) => h.activity), 1);
  const maxParticipation = Math.max(...data.hackathonParticipation.map((h) => h.participants), 1);
  const totalDepartmentUsers = data.departmentStats.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time insights and platform metrics
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 opacity-80" />
              <span className="text-sm bg-blue-400 bg-opacity-50 px-2 py-1 rounded-full">
                +{data.weeklyGrowth}%
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{data.totalUsers}</div>
            <div className="text-blue-100 text-sm">Total Users</div>
            <div className="mt-3 text-xs text-blue-100">
              +{data.todayRegistrations} today
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="h-8 w-8 opacity-80" />
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold mb-1">{data.totalResources}</div>
            <div className="text-green-100 text-sm">Total Resources</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-8 w-8 opacity-80" />
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold mb-1">{data.totalHackathons}</div>
            <div className="text-purple-100 text-sm">Active Hackathons</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
            <div className="flex items-center justify-between mb-2">
              <Download className="h-8 w-8 opacity-80" />
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold mb-1">{data.totalDownloads}</div>
            <div className="text-orange-100 text-sm">Total Downloads</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">User Growth</h3>
                <p className="text-sm text-gray-600">New registrations over time</p>
              </div>
              <Activity className="h-5 w-5 text-indigo-600" />
            </div>
            {data.userGrowth.length > 0 ? (
              <div className="space-y-3">
                {data.userGrowth.slice(-15).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-16">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
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
                <h3 className="text-lg font-bold text-gray-900">Department Distribution</h3>
                <p className="text-sm text-gray-600">Students by department</p>
              </div>
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            {data.departmentStats.length > 0 ? (
              <div className="space-y-4">
                {data.departmentStats.map((dept, idx) => {
                  const percentage = ((dept.count / totalDepartmentUsers) * 100).toFixed(1);
                  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"];
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{dept.department}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {dept.count} <span className="text-gray-500">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${colors[idx % colors.length]} h-full rounded-full transition-all duration-500`}
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

        {/* Hackathon Participation Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Hackathon Participation</h3>
              <p className="text-sm text-gray-600">Monthly participation trends</p>
            </div>
            <Calendar className="h-5 w-5 text-indigo-600" />
          </div>
          {data.hackathonParticipation.length > 0 ? (
            <div className="flex items-end justify-between gap-4 h-64">
              {data.hackathonParticipation.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative flex-1 w-full flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all duration-500 hover:from-purple-600 hover:to-purple-500 cursor-pointer group"
                      style={{ height: `${(item.participants / maxParticipation) * 100}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity">
                        {item.participants} participants
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.month}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No hackathon data available
            </div>
          )}
        </div>

        {/* Resource Downloads Over Time */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Resource Downloads</h3>
              <p className="text-sm text-gray-600">Daily download activity</p>
            </div>
            <Download className="h-5 w-5 text-indigo-600" />
          </div>
          {data.resourceDownloads.length > 0 ? (
            <div className="flex items-end justify-between gap-2 h-48">
              {data.resourceDownloads.slice(-20).map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-300 hover:from-green-600 hover:to-green-500 cursor-pointer group relative"
                    style={{ height: `${(item.downloads / maxDownloads) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity">
                      {item.downloads}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No download data available
            </div>
          )}
        </div>

        {/* Peak Activity Hours Heatmap */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Peak Activity Hours</h3>
              <p className="text-sm text-gray-600">Hourly activity heatmap (24-hour format)</p>
            </div>
            <Clock className="h-5 w-5 text-indigo-600" />
          </div>
          {data.peakHours.length > 0 ? (
            <>
              <div className="grid grid-cols-12 gap-2">
                {data.peakHours.map((item) => {
                  const intensity = (item.activity / maxActivity) * 100;
                  const getColor = () => {
                    if (intensity > 75) return "bg-red-500";
                    if (intensity > 50) return "bg-orange-500";
                    if (intensity > 25) return "bg-yellow-500";
                    return "bg-green-500";
                  };
                  return (
                    <div key={item.hour} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-full aspect-square rounded-lg ${getColor()} transition-all duration-300 hover:scale-110 cursor-pointer group relative`}
                        style={{ opacity: Math.max(intensity / 100, 0.2) }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity z-10">
                          {item.activity} active
                        </div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {item.hour.toString().padStart(2, "0")}h
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500 opacity-30"></div>
                  <span className="text-sm text-gray-600">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500 opacity-50"></div>
                  <span className="text-sm text-gray-600">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500 opacity-75"></div>
                  <span className="text-sm text-gray-600">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-sm text-gray-600">Peak</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No activity data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
