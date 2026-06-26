import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config/apiConfig";

import ProfileHeader from "../components/ProfileHeader";
import ProfileBio from "../components/ProfileBio";
import ProfileSkills from "../components/ProfileSkills";
import ProfileResume from "../components/ProfileResume";
import ProfileActivity from "../components/ProfileActivity";
import ProfileExtraFields from "../components/ProfileExtraFields";

export interface ProfileForm {
  name: string;
  bio: string;
  location: string;
  skills: string[];
  avatarFile: File | null;
  avatar: string;
  resumeFile: File | null;
  resumeUrl: string;
  yearOfAdmission: string;
  yearOfGraduation: string;
  course: string;
  branch: string;
  college: string;
  website: string;
  linkedin: string;
  github: string;
  activities?: { title: string; description: string; type?: string }[];
}

const Profile = () => {
   console.log("🚀 Profile Component Rendered!");
  const { userId } = useParams(); // Get userId from URL
   
  const { currentUser, updateProfile, getProfile } = useAuth();
  console.log("userId:", userId);
  console.log("currentUser:", currentUser);
  if (!currentUser) {
    console.log("❌ No currentUser, redirecting...");
    void (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please login to view profiles</p>
        </div>
      </div>
    );
  }
  
 
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    bio: "",
    location: "",
    skills: [],
    avatarFile: null,
    avatar: "",
    resumeFile: null,
    resumeUrl: "",
    yearOfAdmission: "",
    yearOfGraduation: "",
    course: "",
    branch: "",
    college: "",
    website: "",
    linkedin: "",
    github: "",
    activities: [],
  });

  const [profileUser, setProfileUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  const API_URL = API_BASE_URL;

  // Check if viewing own profile or someone else's
  const isOwnProfile = !userId || userId === currentUser?._id;

  useEffect(() => {
    const loadProfile = async () => {
      setFetchingProfile(true);
          console.log("=== PROFILE DEBUG ===");
    console.log("userId from URL:", userId);
    console.log("currentUser._id:", currentUser?._id);
    console.log("isOwnProfile:", isOwnProfile);
    console.log("API_URL:", API_URL);
    console.log("====================");
      try {
        let profileData;

        if (isOwnProfile) {
          // Load own profile
          console.log("Loading own profile...");
          profileData = await getProfile();
          setProfileUser(currentUser);
        } else {
          // Load another user's profile
          console.log("Loading user profile:", userId);
          const res = await axios.get(`${API_URL}/users/${userId}`, {
            withCredentials: true,
          });
          profileData = res.data.user;
          setProfileUser(profileData);
        }

        console.log("Profile data fetched:", profileData);

        if (profileData) {
          setForm({
            name: profileData.name || "",
            bio: profileData.bio || "",
            location: profileData.location || "",
            skills: Array.isArray(profileData.skills) ? profileData.skills : [],
            avatarFile: null,
            avatar: profileData.avatar || "",
            resumeFile: null,
            resumeUrl: profileData.resumeUrl || "",
            yearOfAdmission: profileData.admissionYear?.toString() || "",
            yearOfGraduation: profileData.graduationYear?.toString() || "",
            course: profileData.course || "",
            branch: profileData.branch || "",
            college: profileData.college || "",
            website: profileData.website || "",
            linkedin: profileData.linkedin || "",
            github: profileData.github || "",
            activities: Array.isArray(profileData.activities)
              ? profileData.activities
              : [],
          });
        }
      } catch (error: any) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setFetchingProfile(false);
      }
    };

    loadProfile();
  }, [userId, currentUser?._id]);

  const handleSubmit = async () => {
    if (!isOwnProfile) {
      toast.error("You can only edit your own profile");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (
          (key === "avatarFile" || key === "resumeFile") &&
          value instanceof File
        ) {
          formData.append(key === "avatarFile" ? "avatar" : "resume", value);
        } else if (key === "skills" || key === "activities") {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === "string") {
          formData.append(key, value);
        }
      });

      // Send formData to backend
      const updatedProfile = await updateProfile(formData);
      setForm((prev) => ({
        ...prev,
        name: updatedProfile.name || prev.name,
        bio: updatedProfile.bio || prev.bio,
        location: updatedProfile.location || prev.location,
        skills: updatedProfile.skills || prev.skills,
        avatar: updatedProfile.avatar || prev.avatar,
        resumeUrl: updatedProfile.resumeUrl || prev.resumeUrl,
        yearOfAdmission:
          updatedProfile.admissionYear?.toString() || prev.yearOfAdmission,
        yearOfGraduation:
          updatedProfile.graduationYear?.toString() || prev.yearOfGraduation,
        course: updatedProfile.course || prev.course,
        branch: updatedProfile.branch || prev.branch,
        college: updatedProfile.college || prev.college,
        website: updatedProfile.website || prev.website,
        linkedin: updatedProfile.linkedin || prev.linkedin,
        github: updatedProfile.github || prev.github,
        activities: updatedProfile.activities || prev.activities,
        avatarFile: null,
        resumeFile: null,
      }));

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please login to view profiles</p>
        </div>
      </div>
    );
  }

  if (fetchingProfile || !profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <ProfileHeader
        form={form}
        setForm={setForm}
        isEditing={isEditing && isOwnProfile}
        setIsEditing={setIsEditing}
        loading={loading}
        handleSubmit={handleSubmit}
        currentUser={profileUser}
        isOwnProfile={isOwnProfile}
      />

      {/* Bio + Extra Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProfileBio 
            form={form} 
            setForm={setForm} 
            isEditing={isEditing && isOwnProfile} 
          />
          <ProfileSkills 
            form={form} 
            setForm={setForm} 
            isEditing={isEditing && isOwnProfile} 
          />
          <ProfileResume 
            form={form} 
            setForm={setForm} 
            isEditing={isEditing && isOwnProfile} 
          />
        </div>

        <ProfileExtraFields
          form={form}
          setForm={setForm}
          isEditing={isEditing && isOwnProfile}
        />
      </div>

      {/* Recent Activity */}
      <ProfileActivity 
        form={form} 
        setForm={setForm} 
        isEditing={isEditing && isOwnProfile} 
      />
    </div>
  );
};

export default Profile;
