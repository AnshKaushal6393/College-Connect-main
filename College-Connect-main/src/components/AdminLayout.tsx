import { useState } from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Upload,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is admin
  const isAdmin = currentUser?.isAdmin || currentUser?.role === "admin";

  // Redirect if not admin
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    toast.error("Access denied. Admin privileges required.");
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    {
      path: "/admin",
      icon: LayoutDashboard,
      label: "Dashboard",
      description: "User verifications",
    },
    {
      path: "/admin/analytics",
      icon: BarChart3,
      label: "Analytics",
      description: "Platform insights",
    },
    {
      path: "/admin/hackathons",
      icon: Calendar,
      label: "Hackathons",
      description: "Manage events",
    },
    {
      path: "/admin/users",
      icon: Users,
      label: "All Users",
      description: "View all users",
    },
    {
      path: "/resources",
      icon: Upload,
      label: "Resources",
      description: "Manage uploads",
    },
  ];

  console.log(menuItems);
  

  const isActivePath = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-white border-r border-gray-200
          transform lg:transform-none transition-transform duration-300
          flex flex-col ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Admin Panel</h2>
              <p className="text-xs text-gray-500">CollegeConnect</p>
            </div>
          </Link>
          <button
            title="side"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {currentUser.name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {currentUser.email}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-indigo-600" : "text-gray-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-sm">Back to Main Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <button
            title="side"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-700 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 lg:ml-0 ml-4">
            <h1 className="text-xl font-bold text-gray-900">
              {menuItems.find((item) => isActivePath(item.path))?.label ||
                "Admin Panel"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to={`/profile/${currentUser._id}`}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              View Profile
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
