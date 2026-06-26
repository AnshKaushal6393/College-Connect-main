import {
  X,
  Mail,
  Linkedin,
  Github,
  ExternalLink,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  Code,
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config/apiConfig";

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  location?: string;
  college?: string;
  course?: string;
  branch?: string;
  yearOfAdmission?: string;
  yearOfGraduation?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  resumeUrl?: string;
  activities?: Array<{
    title: string;
    description: string;
    type: "code" | "work" | "achievement";
  }>;
  createdAt: string;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  onClose,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = API_BASE_URL;

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/network/user/${userId}`, {
        withCredentials: true,
      });
      setUser(res.data.user);
    } catch (error) {
      console.error("Fetch user profile error:", error);
      toast.error("Failed to load user profile");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (!user) return;

    if (user.linkedin) {
      window.open(user.linkedin, "_blank");
      toast.success("Opening LinkedIn profile...");
    } else if (user.github) {
      window.open(user.github, "_blank");
      toast.success("Opening GitHub profile...");
    } else if (user.website) {
      window.open(user.website, "_blank");
      toast.success("Opening website...");
    } else {
      window.location.href = `mailto:${user.email}?subject=Connection Request from CollegeConnect`;
      toast.success("Opening email client...");
    }
  };

  const getActivityIcon = (type?: string) => {
    switch (type) {
      case "work":
        return <Briefcase className="w-5 h-5 text-green-600" />;
      case "achievement":
        return <Award className="w-5 h-5 text-yellow-600" />;
      default:
        return <Code className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "alumni":
        return "bg-purple-100 text-purple-700";
      case "senior":
        return "bg-blue-100 text-blue-700";
      case "admin":
        return "bg-red-100 text-red-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-6">
            <img
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${user.name}&size=128`
              }
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-3xl font-bold text-gray-900">
                  {user.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </span>
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {user.location}
                  </span>
                )}
              </div>

              {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}

              <div className="flex items-center gap-3">
                {user.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {user.github && (
                  <a
                    href={user.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
                    title="GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    title="Website"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
                {user.resumeUrl && (
                  <a
                    href={user.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Download className="w-4 h-4" />
                    Resume
                  </a>
                )}
              </div>
            </div>
          </div>

          {(user.college || user.course || user.branch) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Education
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {user.college && (
                  <div>
                    <p className="text-gray-500">College</p>
                    <p className="font-medium text-gray-900">{user.college}</p>
                  </div>
                )}
                {user.course && (
                  <div>
                    <p className="text-gray-500">Course</p>
                    <p className="font-medium text-gray-900">{user.course}</p>
                  </div>
                )}
                {user.branch && (
                  <div>
                    <p className="text-gray-500">Branch</p>
                    <p className="font-medium text-gray-900">{user.branch}</p>
                  </div>
                )}
                {user.yearOfAdmission && (
                  <div>
                    <p className="text-gray-500">Year of Admission</p>
                    <p className="font-medium text-gray-900">
                      {user.yearOfAdmission}
                    </p>
                  </div>
                )}
                {user.yearOfGraduation && (
                  <div>
                    <p className="text-gray-500">Year of Graduation</p>
                    <p className="font-medium text-gray-900">
                      {user.yearOfGraduation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {user.skills && user.skills.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.activities && user.activities.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Recent Activity
              </h4>
              <div className="space-y-3">
                {user.activities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {activity.title}
                      </p>
                      {activity.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-white transition"
          >
            Close
          </button>
          <button
            onClick={handleConnect}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            {user.linkedin ? (
              <>
                <Linkedin className="w-4 h-4" />
                Connect on LinkedIn
              </>
            ) : user.github ? (
              <>
                <Github className="w-4 h-4" />
                View GitHub
              </>
            ) : user.website ? (
              <>
                <ExternalLink className="w-4 h-4" />
                Visit Website
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
