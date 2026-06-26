import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  BookOpen,
  Download,
  Share2,
  Upload,
  X,
  Eye,
  Heart,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
} from "lucide-react";
import api from "../services/api";
import { useDebounce } from "../hooks/useDebounce";
import { RESOURCE_CATEGORIES } from "../constants";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import UserProfileModal from "../components/UserProfileModal";

interface Resource {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  likes: string[];
  downloads: number;
  views: number;
  comments: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
}

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalResources: 0, totalDownloads: 0 });

  const { currentUser } = useAuth();

  const isAdmin = currentUser?.isAdmin || currentUser?.role === "admin";

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchResources();
    fetchStats();
  }, [categoryFilter, sortBy, debouncedSearch]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (sortBy) params.append("sortBy", sortBy);

      const res = await api.get(`/resources?${params.toString()}`);
      setResources(res.data.resources);
    } catch (error) {
      console.error("Fetch resources error:", error);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get(`/resources/stats`);
      setStats(res.data.stats);
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  const handleSearch = () => {
    fetchResources();
  };

  const handleLike = async (resourceId: string) => {
    if (!currentUser) {
      toast.error("Please login to like resources");
      return;
    }

    try {
      await api.post(
        `/resources/${resourceId}/like`,
        {},
        { withCredentials: true }
      );
      fetchResources();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to like resource");
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      // Track download
      await api.post(
        `/resources/${resource._id}/download`,
        {},
        { withCredentials: true }
      );

      // Open file in new tab
      window.open(resource.fileUrl, "_blank");
      toast.success("Download started!");
      fetchResources();
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download");
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      await api.delete(`/resources/${resourceId}`, {
        withCredentials: true,
      });
      toast.success("Resource deleted successfully");
      fetchResources();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete resource");
    }
  };

  const handleShare = (resource: Resource) => {
    const shareUrl = `${window.location.origin}/resources/${resource._id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const isLiked = (resource: Resource) => {
    return currentUser && resource.likes.includes(currentUser._id);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
      case "doc":
      case "docx":
        return <FileText className="h-8 w-8 text-red-600" />;
      case "image":
        return <ImageIcon className="h-8 w-8 text-blue-600" />;
      case "video":
        return <Video className="h-8 w-8 text-purple-600" />;
      case "zip":
        return <Archive className="h-8 w-8 text-yellow-600" />;
      default:
        return <FileText className="h-8 w-8 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Learning Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Access and share valuable learning materials with your college
            community.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-xl shadow-sm p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">
              {stats.totalResources}
            </div>
            <div className="text-gray-600 text-sm">Resources</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.totalDownloads}
            </div>
            <div className="text-gray-600 text-sm">Downloads</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {RESOURCE_CATEGORIES.length}
            </div>
            <div className="text-gray-600 text-sm">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {resources.length}
            </div>
            <div className="text-gray-600 text-sm">Showing</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg"
              aria-label="Sort by"
            >
              <option value="recent">Recent First</option>
              <option value="popular">Most Downloaded</option>
              <option value="liked">Most Liked</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 border rounded-lg transition ${
                showFilters ? "bg-indigo-600 text-white" : "hover:bg-gray-50"
              }`}
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>

            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Search
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Filter by Category
                </h3>
                <button
                  onClick={() => setCategoryFilter("all")}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`px-4 py-2 rounded-lg transition ${
                    categoryFilter === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {RESOURCE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-lg transition ${
                      categoryFilter === cat
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resources Grid */}
        {resources.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Resources Found
            </h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div
                key={resource._id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      {getFileIcon(resource.fileType)}
                    </div>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {resource.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {resource.description}
                  </p>

                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resource.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {resource.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {resource.downloads}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {resource.likes.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                    <img
                      src={
                        resource.uploadedBy.avatar ||
                        `https://ui-avatars.com/api/?name=${resource.uploadedBy.name}`
                      }
                      alt={resource.uploadedBy.name}
                      className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-500 transition"
                      onClick={() => setSelectedUserId(resource.uploadedBy._id)}
                      title="View profile"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {resource.uploadedBy.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(resource.fileSize)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLike(resource._id)}
                      className={`flex-1 px-3 py-2 rounded-lg transition flex items-center justify-center ${
                        isLiked(resource)
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                      title="Like"
                    >
                      <Heart
                        className={`h-4 w-4 mr-1 ${
                          isLiked(resource) ? "fill-current" : ""
                        }`}
                      />
                      {resource.likes.length}
                    </button>
                    <button
                      onClick={() => handleDownload(resource)}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                    <button
                      onClick={() => handleShare(resource)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(resource._id)}
                        className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && isAdmin && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchResources();
          }}
        />
      )}

      {/* Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
};

// ===== UPLOAD MODAL COMPONENT =====
interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Notes",
    tags: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const categories = [
    "Notes",
    "Books",
    "Projects",
    "Tutorials",
    "Interview Prep",
    "Research Papers",
    "Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("tags", form.tags);
      formData.append("file", file);

      await api.post(`/resources`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Resource uploaded successfully!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to upload resource");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            Upload Resource
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              title="form"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              title="Description"
              placeholder="Enter a brief description of the resource"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="upload-category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category *
              </label>
              <select
                id="upload-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="React, Node.js, Tutorial"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="resource-file"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              File * (Max 50MB)
            </label>
            <input
              id="resource-file"
              title="Select a file"
              placeholder="Select a file"
              aria-label="File upload (Max 50MB)"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}{" "}
                MB)
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Resources;
