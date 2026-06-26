import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Code2,
  MessageCircle,
  Plus,
  X,
  Users,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Clock,
  Eye,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import UserProfileModal from "../components/UserProfileModal";
import { useNavigate } from "react-router-dom";

interface TeamRequest {
  _id: string;
  title: string;
  description: string;
  event: string;
  eventType: string;
  skillsNeeded: string[];
  spotsAvailable: number;
  status: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  teamMembers: any[];
  applications: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
      avatar?: string;
      skills?: string[];
    } | null;
    message: string;
    status: string;
    appliedAt: string;
  }>;
  createdAt: string;
  tags?: string[];
}

const TeamBuilder = () => {
  const [activeTab, setActiveTab] = useState<
    "all" | "my-requests" | "my-applications" | "bookmarked"
  >("all");
  const [teamRequests, setTeamRequests] = useState<TeamRequest[]>([]);
  const [myRequests, setMyRequests] = useState<TeamRequest[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TeamRequest | null>(
    null
  );
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    eventType: "all",
    status: "all",
    skills: "",
  });
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "closing">(
    "recent"
  );

  const { currentUser } = useAuth();

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    event: "",
    eventType: "hackathon",
    skillsNeeded: "",
    spotsAvailable: 1,
    deadline: "",
    tags: "",
  });

  useEffect(() => {
    if (activeTab === "all") {
      fetchTeamRequests();
    } else if (activeTab === "my-requests") {
      fetchMyRequests();
    } else if (activeTab === "my-applications") {
      fetchMyApplications();
    }
    loadBookmarks();
  }, [activeTab]);

  const loadBookmarks = () => {
    try {
      const saved = localStorage.getItem("teamBuilderBookmarks");
      if (saved) {
        setBookmarkedIds(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Load bookmarks error:", error);
    }
  };

  const saveBookmarks = (ids: string[]) => {
    try {
      localStorage.setItem("teamBuilderBookmarks", JSON.stringify(ids));
      setBookmarkedIds(ids);
    } catch (error) {
      console.error("Save bookmarks error:", error);
      toast.error("Failed to save bookmark");
    }
  };

  const toggleBookmark = (requestId: string) => {
    const isBookmarked = bookmarkedIds.includes(requestId);

    if (isBookmarked) {
      const newBookmarks = bookmarkedIds.filter((id) => id !== requestId);
      saveBookmarks(newBookmarks);
      toast.success("Removed from bookmarks");
    } else {
      const newBookmarks = [...bookmarkedIds, requestId];
      saveBookmarks(newBookmarks);
      toast.success("Added to bookmarks");
    }
  };

  const isBookmarked = (requestId: string) => {
    return bookmarkedIds.includes(requestId);
  };

  const getBookmarkedRequests = () => {
    return teamRequests.filter((req) => bookmarkedIds.includes(req._id));
  };

  const fetchTeamRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filters.eventType !== "all")
        params.append("eventType", filters.eventType);
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.skills) params.append("skills", filters.skills);

      const res = await api.get(`/team-builder?${params.toString()}`);
      let requests = res.data.teamRequests;

      requests = sortRequests(requests);
      setTeamRequests(requests);
    } catch (error) {
      console.error("Fetch team requests error:", error);
      toast.error("Failed to load team requests");
    } finally {
      setLoading(false);
    }
  };

  const sortRequests = (requests: TeamRequest[]) => {
    const sorted = [...requests];

    switch (sortBy) {
      case "recent":
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "popular":
        return sorted.sort(
          (a, b) =>
            (b.applications?.length || 0) - (a.applications?.length || 0)
        );
      case "closing":
        return sorted.sort((a, b) => a.spotsAvailable - b.spotsAvailable);
      default:
        return sorted;
    }
  };

  const clearFilters = () => {
    setFilters({
      eventType: "all",
      status: "all",
      skills: "",
    });
    setSearchQuery("");
    setSortBy("recent");
  };

  useEffect(() => {
    if (activeTab === "all") {
      fetchTeamRequests();
    }
    if (bookmarkedIds.length === 0) {
      loadBookmarks();
    }
  }, [filters, sortBy]);

  const fetchMyRequests = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await api.get(`/team-builder/my/requests`, {
        withCredentials: true,
      });
      setMyRequests(res.data.teamRequests);
    } catch (error) {
      console.error("Fetch my requests error:", error);
      toast.error("Failed to load your requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await api.get(`/team-builder/my/applications`, {
        withCredentials: true,
      });
      setMyApplications(res.data.applications);
    } catch (error) {
      console.error("Fetch my applications error:", error);
      toast.error("Failed to load your applications");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTeamRequests();
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Please login to create a team request");
      return;
    }

    setFormLoading(true);
    try {
      await api.post(
        `/team-builder`,
        {
          ...createForm,
          skillsNeeded: createForm.skillsNeeded.split(",").map((s) => s.trim()),
          tags: createForm.tags
            ? createForm.tags.split(",").map((t) => t.trim())
            : [],
        },
        { withCredentials: true }
      );

      toast.success("Team request created successfully!");
      setShowCreateModal(false);
      setCreateForm({
        title: "",
        description: "",
        event: "",
        eventType: "hackathon",
        skillsNeeded: "",
        spotsAvailable: 1,
        deadline: "",
        tags: "",
      });
      if (activeTab === "all") fetchTeamRequests();
      else if (activeTab === "my-requests") fetchMyRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create request");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setFormLoading(true);
    try {
      await api.put(
        `/team-builder/${selectedRequest._id}`,
        {
          ...createForm,
          skillsNeeded: createForm.skillsNeeded.split(",").map((s) => s.trim()),
          tags: createForm.tags
            ? createForm.tags.split(",").map((t) => t.trim())
            : [],
        },
        { withCredentials: true }
      );

      toast.success("Team request updated successfully!");
      setShowEditModal(false);
      setSelectedRequest(null);
      fetchMyRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update request");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      await api.delete(`/team-builder/${requestId}`, {
        withCredentials: true,
      });
      toast.success("Team request deleted successfully!");
      fetchMyRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete request");
    }
  };

  const handleApplyToTeam = async (requestId: string) => {
    if (!currentUser) {
      toast.error("Please login to apply");
      return;
    }

    const message = prompt("Enter a message for the team creator (optional):");

    try {
      await api.post(
        `/team-builder/${requestId}/apply`,
        { message: message || "" },
        { withCredentials: true }
      );
      toast.success("Application submitted successfully!");
      fetchTeamRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to apply");
    }
  };

  const handleApplicationAction = async (
    requestId: string,
    applicationId: string,
    action: "accept" | "reject"
  ) => {
    try {
      await api.post(
        `/team-builder/${requestId}/applications/${applicationId}`,
        { action },
        { withCredentials: true }
      );
      toast.success(`Application ${action}ed successfully!`);
      fetchMyRequests();
      if (selectedRequest) {
        const updated = await api.get(`/team-builder/${requestId}`);
        setSelectedRequest(updated.data.teamRequest);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || `Failed to ${action} application`
      );
    }
  };

  const openEditModal = (request: TeamRequest) => {
    setSelectedRequest(request);
    setCreateForm({
      title: request.title,
      description: request.description,
      event: request.event,
      eventType: request.eventType,
      skillsNeeded: request.skillsNeeded.join(", "),
      spotsAvailable: request.spotsAvailable,
      deadline: "",
      tags: request.tags?.join(", ") || "",
    });
    setShowEditModal(true);
  };

  const openApplicationsModal = (request: TeamRequest) => {
    setSelectedRequest(request);
    setShowApplicationsModal(true);
  };

  const hasUserApplied = (request: TeamRequest) => {
    if (!currentUser) return false;
    return request.applications?.some(
      (app) => app.user && app.user._id === currentUser._id
    );
  };

  const isUserMember = (request: TeamRequest) => {
    if (!currentUser) return false;
    return request.teamMembers?.some(
      (member) => member && member._id === currentUser._id
    );
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
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Team Builder</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect teammates for your next hackathon project.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 bg-white rounded-lg shadow-sm p-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "all"
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Requests
          </button>
          {currentUser && (
            <>
              <button
                onClick={() => setActiveTab("my-requests")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "my-requests"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                My Requests
              </button>
              <button
                onClick={() => setActiveTab("my-applications")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "my-applications"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                My Applications
              </button>
              <button
                onClick={() => setActiveTab("bookmarked")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition relative ${
                  activeTab === "bookmarked"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Bookmark className="h-4 w-4 inline mr-1" />
                Bookmarked
                {bookmarkedIds && bookmarkedIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {bookmarkedIds.length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        {activeTab === "all" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by title, skills, or event..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                aria-label="Sort by"
              >
                <option value="recent">Recent First</option>
                <option value="popular">Most Popular</option>
                <option value="closing">Closing Soon</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center px-4 py-2 border rounded-lg transition ${
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

              {currentUser && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create
                </button>
              )}
            </div>

            {showFilters && (
              <div className="bg-white rounded-lg shadow-sm p-4 space-y-4 border-2 border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Advanced Filters
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <select
                      title="filters evevnt type"
                      value={filters.eventType}
                      onChange={(e) =>
                        setFilters({ ...filters, eventType: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Types</option>
                      <option value="hackathon">Hackathon</option>
                      <option value="project">Project</option>
                      <option value="competition">Competition</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      title="filters"
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Required Skills
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., React, Python"
                      value={filters.skills}
                      onChange={(e) =>
                        setFilters({ ...filters, skills: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {(filters.eventType !== "all" ||
                  filters.status !== "all" ||
                  filters.skills ||
                  sortBy !== "recent") && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <span className="text-sm text-gray-600">
                      Active filters:
                    </span>
                    {sortBy !== "recent" && (
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                        Sort:{" "}
                        {sortBy === "popular" ? "Popular" : "Closing Soon"}
                      </span>
                    )}
                    {filters.eventType !== "all" && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        Type: {filters.eventType}
                      </span>
                    )}
                    {filters.status !== "all" && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        Status: {filters.status}
                      </span>
                    )}
                    {filters.skills && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        Skills: {filters.skills}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "my-requests" && currentUser && (
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Request
            </button>
          </div>
        )}

        {activeTab === "all" && (
          <TeamRequestsList
            requests={teamRequests}
            currentUser={currentUser}
            onApply={handleApplyToTeam}
            hasUserApplied={hasUserApplied}
            isUserMember={isUserMember}
            onViewProfile={setSelectedUserId}
            onBookmark={toggleBookmark}
            isBookmarked={isBookmarked}
          />
        )}

        {activeTab === "my-requests" && (
          <MyRequestsList
            requests={myRequests}
            onEdit={openEditModal}
            onDelete={handleDeleteRequest}
            onViewApplications={openApplicationsModal}
          />
        )}

        {activeTab === "my-applications" && (
          <MyApplicationsList applications={myApplications} />
        )}

        {activeTab === "bookmarked" && (
          <BookmarkedRequestsList
            requests={getBookmarkedRequests()}
            currentUser={currentUser}
            onApply={handleApplyToTeam}
            onBookmark={toggleBookmark}
            hasUserApplied={hasUserApplied}
            isUserMember={isUserMember}
            onViewProfile={setSelectedUserId}
          />
        )}
      </div>

      {(showCreateModal || showEditModal) && (
        <RequestModal
          isEdit={showEditModal}
          form={createForm}
          setForm={setCreateForm}
          onSubmit={showEditModal ? handleEditRequest : handleCreateRequest}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedRequest(null);
          }}
          loading={formLoading}
        />
      )}

      {showApplicationsModal && selectedRequest && (
        <ApplicationsModal
          request={selectedRequest}
          onClose={() => {
            setShowApplicationsModal(false);
            setSelectedRequest(null);
          }}
          onAction={handleApplicationAction}
          onViewProfile={setSelectedUserId}
        />
      )}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
};

interface TeamRequestsListProps {
  requests: TeamRequest[];
  currentUser: any;
  onApply: (requestId: string) => void;
  hasUserApplied: (request: TeamRequest) => boolean;
  isUserMember: (request: TeamRequest) => boolean;
  onViewProfile: (userId: string) => void;
  onBookmark?: (requestId: string) => void;
  isBookmarked?: (requestId: string) => boolean;
}

const TeamRequestsList: React.FC<TeamRequestsListProps> = ({
  requests,
  currentUser,
  onApply,
  hasUserApplied,
  isUserMember,
  onViewProfile,
  onBookmark,
  isBookmarked,
}) => {
  const navigate = useNavigate();

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Team Requests Found
        </h3>
        <p className="text-gray-600">Check back later for new opportunities!</p>
      </div>
    );
  }
  const handleStartChat = async (participantId:string) => {
    if(!currentUser) {
       toast.error("Please login to chat");
       return;
    }
    try {
      const res = await api.post("/chat/conversations",{participantId});
      const conversationId = res.data.conversation._id;
      navigate(`/chat/${conversationId}`);
    } catch (error:any) {
      toast.error(error.response?.data?.error || "Failed to start chat");
    }
  }

  return (
    <div className="space-y-6">
      {requests.map((request: TeamRequest) => {
        // ✅ NULL SAFETY: Check if createdBy exists
        if (!request.createdBy) return null;
        
        return (
          <div
            key={request._id}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <img
                  src={
                    request.createdBy.avatar ||
                    `https://ui-avatars.com/api/?name=${request.createdBy.name}`
                  }
                  alt={request.createdBy.name}
                  className="w-12 h-12 rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-500 transition"
                  onClick={() => onViewProfile(request.createdBy._id)}
                  title="View profile"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {request.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Posted by {request.createdBy.name} ·{" "}
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === "open"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {request.spotsAvailable}{" "}
                  {request.spotsAvailable === 1 ? "spot" : "spots"} left
                </span>
                {isUserMember(request) && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Member
                  </span>
                )}
                {currentUser && onBookmark && isBookmarked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookmark(request._id);
                    }}
                    className={`p-2 rounded-lg transition ${
                      isBookmarked(request._id)
                        ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                    title={
                      isBookmarked(request._id) ? "Remove bookmark" : "Bookmark"
                    }
                  >
                    {isBookmarked(request._id) ? (
                      <BookmarkCheck className="h-5 w-5" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center text-gray-600 mb-2">
                <Code2 className="h-4 w-4 mr-2" />
                <span className="font-medium">{request.event}</span>
                <span className="mx-2">·</span>
                <span className="text-sm">{request.eventType}</span>
              </div>
              <p className="text-gray-600 mb-4">{request.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm font-medium text-gray-700">
                  Skills needed:
                </span>
                {request.skillsNeeded.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {request.tags && request.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {request.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center text-gray-600 text-sm">
                <Users className="h-4 w-4 mr-1" />
                {request.teamMembers?.length || 0} team member(s)
              </div>
              <div className="flex gap-2">
                {currentUser && request.createdBy._id !== currentUser._id && (
                  <>
                    {isUserMember(request) ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
                      >
                        Already Joined
                      </button>
                    ) : hasUserApplied(request) ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg cursor-not-allowed flex items-center"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Application Pending
                      </button>
                    ) : request.status === "open" ? (
                      <button
                        onClick={() => onApply(request._id)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Apply to Join
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-6 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
                      >
                        Closed
                      </button>
                    )}
                  </>
                )}
                <button onClick={()=> handleStartChat(request.createdBy._id)} className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BookmarkedRequestsList: React.FC<TeamRequestsListProps> = (props) => {
  if (props.requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Bookmarks Yet
        </h3>
        <p className="text-gray-600">
          Bookmark team requests to save them for later!
        </p>
      </div>
    );
  }

  return <TeamRequestsList {...props} />;
};

interface MyRequestsListProps {
  requests: TeamRequest[];
  onEdit: (request: TeamRequest) => void;
  onDelete: (requestId: string) => void;
  onViewApplications: (request: TeamRequest) => void;
}

const MyRequestsList: React.FC<MyRequestsListProps> = ({
  requests,
  onEdit,
  onDelete,
  onViewApplications,
}) => {
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Requests Yet
        </h3>
        <p className="text-gray-600">
          Create your first team request to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {requests.map((request: TeamRequest) => (
        <div key={request._id} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {request.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {request.event} · Created{" "}
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === "open"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {request.status}
              </span>
              <button
                onClick={() => onEdit(request)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                title="Edit"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(request._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <p className="text-gray-600 mb-4">{request.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {request.skillsNeeded.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {request.teamMembers?.length || 0} member(s)
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {request.applications?.length || 0} application(s)
              </span>
              <span>{request.spotsAvailable} spot(s) left</span>
            </div>
            <button
              onClick={() => onViewApplications(request)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Applications (
              {
                request.applications?.filter((a) => a.status === "pending")
                  .length || 0
              }
              )
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

interface MyApplicationsListProps {
  applications: any[];
}

const MyApplicationsList: React.FC<MyApplicationsListProps> = ({
  applications,
}) => {
  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Applications Yet
        </h3>
        <p className="text-gray-600">
          Start applying to teams to see your applications here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {applications.map((app: any) => (
        <div key={app._id} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {app.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {app.event} · Posted by {app.createdBy?.name || "Unknown"}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                app.myApplication?.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : app.myApplication?.status === "accepted"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {app.myApplication?.status
                ? app.myApplication.status.charAt(0).toUpperCase() +
                  app.myApplication.status.slice(1)
                : "Unknown"}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{app.description}</p>

          {app.myApplication?.message && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-700">Your Message:</p>
              <p className="text-sm text-gray-600">
                {app.myApplication.message}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {app.skillsNeeded?.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <p className="text-sm text-gray-500">
              Applied on{" "}
              {app.myApplication?.appliedAt
                ? new Date(app.myApplication.appliedAt).toLocaleDateString()
                : "Unknown"}
            </p>
            {app.myApplication?.status === "accepted" && (
              <span className="flex items-center text-green-600 font-medium">
                <CheckCircle className="h-4 w-4 mr-1" />
                You're now a team member!
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

interface RequestModalProps {
  isEdit: boolean;
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading: boolean;
}

const RequestModal: React.FC<RequestModalProps> = ({
  isEdit,
  form,
  setForm,
  onSubmit,
  onClose,
  loading,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
    <div className="bg-white rounded-xl max-w-2xl w-full my-8">
      <div className="flex items-center justify-between p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-900">
          {isEdit ? "Edit" : "Create"} Team Request
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          title="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Looking for Frontend Developer"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe what you're looking for..."
            rows={3}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event/Hackathon *
            </label>
            <input
              type="text"
              value={form.event}
              onChange={(e) => setForm({ ...form, event: e.target.value })}
              placeholder="e.g., College Tech Challenge"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              title="eventType"
              value={form.eventType}
              onChange={(e) => setForm({ ...form, eventType: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="hackathon">Hackathon</option>
              <option value="project">Project</option>
              <option value="competition">Competition</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skills Needed * (comma-separated)
          </label>
          <input
            type="text"
            value={form.skillsNeeded}
            onChange={(e) => setForm({ ...form, skillsNeeded: e.target.value })}
            placeholder="React, Node.js, UI/UX"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="spotsAvailable"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Spots Available *
            </label>
            <input
              id="spotsAvailable"
              type="number"
              min="1"
              max="10"
              placeholder="Number of spots"
              title="Number of spots available"
              value={form.spotsAvailable}
              onChange={(e) =>
                setForm({ ...form, spotsAvailable: parseInt(e.target.value) })
              }
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="deadline"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Deadline (Optional)
            </label>
            <input
              id="deadline"
              type="date"
              placeholder="Select a deadline"
              title="Deadline (optional)"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated, optional)
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="AI, Web3, Mobile"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
              ? "Update"
              : "Create"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

interface ApplicationsModalProps {
  request: TeamRequest;
  onClose: () => void;
  onAction: (
    requestId: string,
    applicationId: string,
    action: "accept" | "reject"
  ) => void;
  onViewProfile?: (userId: string) => void;
}

const ApplicationsModal: React.FC<ApplicationsModalProps> = ({
  request,
  onClose,
  onAction,
  onViewProfile,
}) => {
  // Filter out falsy users to avoid null dereferences in render
  const validApplications = request.applications.filter((app) => !!app.user);

  const pendingApps = validApplications.filter((app) => app.status === "pending");
  const acceptedApps = validApplications.filter((app) => app.status === "accepted");
  const rejectedApps = validApplications.filter((app) => app.status === "rejected");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Applications
            </h3>
            <p className="text-sm text-gray-600">{request.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {pendingApps.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                Pending ({pendingApps.length})
              </h4>
              <div className="space-y-4">
                {pendingApps.map((app) => (
                  <div key={app._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            app.user?.avatar ||
                            `https://ui-avatars.com/api/?name=${app.user?.name || "User"}`
                          }
                          alt={app.user?.name || "User"}
                          className="w-12 h-12 rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-500 transition"
                          onClick={() =>
                            onViewProfile && app.user && onViewProfile(app.user._id)
                          }
                          title="View profile"
                        />
                        <div>
                          <h5
                            className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600"
                            onClick={() =>
                              onViewProfile && app.user && onViewProfile(app.user._id)
                            }
                          >
                            {app.user?.name || "User"}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {app.user?.email || ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {app.user?.skills && app.user.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {app.user.skills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {app.message && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700">{app.message}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => onAction(request._id, app._id, "accept")}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </button>
                      <button
                        onClick={() => onAction(request._id, app._id, "reject")}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {acceptedApps.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Accepted ({acceptedApps.length})
              </h4>
              <div className="space-y-3">
                {acceptedApps.map((app) => (
                  <div
                    key={app._id}
                    className="border border-green-200 bg-green-50 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          app.user?.avatar ||
                          `https://ui-avatars.com/api/?name=${app.user?.name || "User"}`
                        }
                        alt={app.user?.name || "User"}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">
                          {app.user?.name || "User"}
                        </h5>
                        <p className="text-xs text-gray-600">
                          {app.user?.email || ""}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">
                        Team Member
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rejectedApps.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <XCircle className="h-5 w-5 mr-2 text-red-600" />
                Rejected ({rejectedApps.length})
              </h4>
              <div className="space-y-3">
                {rejectedApps.map((app) => (
                  <div
                    key={app._id}
                    className="border border-gray-200 bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          app.user?.avatar ||
                          `https://ui-avatars.com/api/?name=${app.user?.name || "User"}`
                        }
                        alt={app.user?.name || "User"}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {app.user?.name || "User"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {validApplications.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Applications Yet
              </h4>
              <p className="text-gray-600">
                Applications will appear here once users apply.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamBuilder;
