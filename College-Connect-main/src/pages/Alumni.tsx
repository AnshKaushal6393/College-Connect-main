import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  Search,
  Filter,
  Mail,
  Linkedin,
  Github,
  ExternalLink,
  Eye,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import UserProfileModal from "../components/UserProfileModal";
import { API_BASE_URL } from "../config/apiConfig";

interface Alumni {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  skills: string[];
  bio?: string;
  college?: string;
  yearOfGraduation?: string;
  course?: string;
  branch?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

const Alumni = () => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [stats, setStats] = useState({ alumniCount: 0, seniorCount: 0 });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const API_URL = API_BASE_URL;

  useEffect(() => {
    fetchAlumni();
    fetchStats();
  }, []);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (collegeFilter) params.append("college", collegeFilter);
      if (yearFilter) params.append("graduationYear", yearFilter);

      const res = await axios.get(
        `${API_URL}/network/alumni?${params.toString()}`
      );
      setAlumni(res.data.alumni);
    } catch (error) {
      console.error("Fetch alumni error:", error);
      toast.error("Failed to load alumni");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/network/stats`);
      setStats(res.data.stats);
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  const handleSearch = () => {
    fetchAlumni();
  };

  const handleConnect = (person: Alumni) => {
    // Priority: LinkedIn > GitHub > Website > Email
    if (person.linkedin) {
      window.open(person.linkedin, "_blank");
      toast.success("Opening LinkedIn profile...");
    } else if (person.github) {
      window.open(person.github, "_blank");
      toast.success("Opening GitHub profile...");
    } else if (person.website) {
      window.open(person.website, "_blank");
      toast.success("Opening website...");
    } else {
      window.location.href = `mailto:${person.email}?subject=Connection Request from CollegeConnect`;
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
          <h1 className="text-4xl font-bold text-gray-900">Alumni Network</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with successful graduates for mentorship and career
            opportunities.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-xl shadow-sm p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">
              {stats.alumniCount}
            </div>
            <div className="text-gray-600 text-sm">Alumni</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.seniorCount}
            </div>
            <div className="text-gray-600 text-sm">Seniors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {stats.alumniCount + stats.seniorCount}
            </div>
            <div className="text-gray-600 text-sm">Total Mentors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {alumni.length}
            </div>
            <div className="text-gray-600 text-sm">Showing</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search alumni by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <input
            type="text"
            placeholder="College"
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            aria-label="Graduation Year Filter"
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Search
          </button>
        </div>

        {/* Alumni Grid */}
        {alumni.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Alumni Found
            </h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map((person) => (
              <div
                key={person._id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      person.avatar ||
                      `https://ui-avatars.com/api/?name=${person.name}`
                    }
                    alt={person.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {person.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {person.course || "Alumni"}
                    </p>
                    {person.college && (
                      <p className="text-gray-500 text-xs">{person.college}</p>
                    )}
                  </div>
                </div>

                {person.bio && (
                  <p className="mt-4 text-gray-600 text-sm line-clamp-2">
                    {person.bio}
                  </p>
                )}

                <div className="mt-4">
                  {person.yearOfGraduation && (
                    <p className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Class of {person.yearOfGraduation}
                    </p>
                  )}
                  {person.skills && person.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {person.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {person.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{person.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="mt-4 flex items-center gap-3">
                  {person.linkedin && (
                    <a
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                      title="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {person.github && (
                    <a
                      href={person.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-900"
                      title="GitHub"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {person.website && (
                    <a
                      href={person.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700"
                      title="Website"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => setSelectedUserId(person._id)}
                    className="flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-sm flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Profile
                  </button>
                  <button
                    onClick={() => handleConnect(person)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm flex items-center justify-center"
                  >
                    {person.linkedin ? (
                      <>
                        <Linkedin className="h-4 w-4 mr-1" />
                        LinkedIn
                      </>
                    ) : person.github ? (
                      <>
                        <Github className="h-4 w-4 mr-1" />
                        GitHub
                      </>
                    ) : person.website ? (
                      <>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Website
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
};

export default Alumni;
