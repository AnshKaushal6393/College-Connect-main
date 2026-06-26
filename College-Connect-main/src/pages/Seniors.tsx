import { useEffect, useState } from "react";
import { Search, MessageCircle, Code2, Users, Mail, Linkedin, Github, ExternalLink } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config/apiConfig";

interface Senior {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  skills: string[];
  bio?: string;
  college?: string;
  course?: string;
  branch?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  activities?: { title: string; description: string; type: string }[];
}

const Seniors = () => {
  const [seniors, setSeniors] = useState<Senior[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  const API_URL = API_BASE_URL;

  useEffect(() => {
    fetchSeniors();
  }, []);

  const fetchSeniors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (branchFilter) params.append("branch", branchFilter);
      if (skillFilter) params.append("skills", skillFilter);

      const res = await axios.get(`${API_URL}/network/seniors?${params.toString()}`);
      setSeniors(res.data.seniors);
    } catch (error) {
      console.error("Fetch seniors error:", error);
      toast.error("Failed to load seniors");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSeniors();
  };

  const handleConnect = (senior: Senior) => {
    // Priority: LinkedIn > GitHub > Website > Email
    if (senior.linkedin) {
      window.open(senior.linkedin, "_blank");
      toast.success("Opening LinkedIn profile...");
    } else if (senior.github) {
      window.open(senior.github, "_blank");
      toast.success("Opening GitHub profile...");
    } else if (senior.website) {
      window.open(senior.website, "_blank");
      toast.success("Opening website...");
    } else {
      window.location.href = `mailto:${senior.email}?subject=Connection Request from CollegeConnect`;
      toast.success("Opening email client...");
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
    <div className="space-y-8 min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Connect with Seniors</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn from experienced seniors and get guidance for your academic journey.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, skills, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            aria-label="Branch Filter"
          >
            <option value="">All Branches</option>
            <option value="Computer Science">Computer Science</option>
            <option value="IT">Information Technology</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Electrical">Electrical</option>
            <option value="Civil">Civil</option>
          </select>
          <input
            type="text"
            placeholder="Filter by skill"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Search
          </button>
        </div>

        {/* Seniors Grid */}
        {seniors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Seniors Found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seniors.map((senior) => (
              <div key={senior._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex items-center space-x-4">
                  <img
                    src={senior.avatar || `https://ui-avatars.com/api/?name=${senior.name}`}
                    alt={senior.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{senior.name}</h3>
                    <p className="text-gray-600 text-sm">{senior.course || senior.branch || "Senior"}</p>
                    {senior.college && (
                      <p className="text-gray-500 text-xs">{senior.college}</p>
                    )}
                  </div>
                </div>

                {senior.bio && (
                  <p className="mt-4 text-gray-600 text-sm line-clamp-2">{senior.bio}</p>
                )}

                <div className="mt-4 space-y-4">
                  {senior.skills && senior.skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {senior.skills.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {senior.skills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{senior.skills.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {senior.activities && senior.activities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Achievements</h4>
                      <ul className="space-y-1">
                        {senior.activities.slice(0, 2).map((activity, idx) => (
                          <li key={idx} className="text-sm text-gray-600">
                            • {activity.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="mt-4 flex items-center gap-3">
                  {senior.linkedin && (
                    <a
                      href={senior.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                      title="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {senior.github && (
                    <a
                      href={senior.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-900"
                      title="GitHub"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {senior.website && (
                    <a
                      href={senior.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700"
                      title="Website"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => handleConnect(senior)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
                  >
                    {senior.linkedin ? (
                      <>
                        <Linkedin className="h-4 w-4 mr-2" />
                        Connect on LinkedIn
                      </>
                    ) : senior.github ? (
                      <>
                        <Github className="h-4 w-4 mr-2" />
                        View GitHub
                      </>
                    ) : senior.website ? (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <button 
            onClick={() => toast("Direct messaging feature coming soon! Use the Connect button to email seniors.")}
            className="flex items-center justify-center space-x-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
          >
            <MessageCircle className="h-6 w-6 text-indigo-600" />
            <span className="font-medium">Ask for Guidance</span>
          </button>
          <button 
            onClick={() => {
              toast.success("Redirecting to Team Builder...");
              setTimeout(() => window.location.href = "/team-builder", 500);
            }}
            className="flex items-center justify-center space-x-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
          >
            <Code2 className="h-6 w-6 text-indigo-600" />
            <span className="font-medium">Join Project Teams</span>
          </button>
          <button 
            onClick={() => toast("Study Groups feature coming soon!")}
            className="flex items-center justify-center space-x-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
          >
            <Users className="h-6 w-6 text-indigo-600" />
            <span className="font-medium">Study Groups</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Seniors;
