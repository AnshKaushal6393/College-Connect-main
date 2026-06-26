import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config/apiConfig";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  skills?: string[];
  avatar?: string;
  location?: string;
  admissionYear?: number;
  graduationYear?: number;
  currentYear?: number;
  course?: string;
  branch?: string;
  createdAt?: string;
  updatedAt?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  resumeUrl?: string;
  college?: string;
  activities?: { title: string; description: string; type?: string }[];
  verificationStatus?: "pending" | "approved" | "rejected";
  studentIdUrl?: string;
  rejectionReason?: string;
  isAdmin?: boolean;
  roleLastUpdated?: string;
  personalEmail?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (
    name: string,
    email: string,
    password: string,
    role: string,
    verificationFile?: File | null,
    admissionYear?: string,
    graduationYear?: string,
    passoutYear?: string,
    personalEmail?: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: () => Promise<User | null>;
  updateProfile: (data: FormData) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const AUTH_URL = `${API_BASE_URL}/auth`;
  const PROFILE_URL = `${API_BASE_URL}/profile`;

  // ⭐ FIXED: Load token on mount and fetch profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      getProfile()
        .catch(() => {
          setCurrentUser(null);
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // ⭐ FIXED: Signup - Store token in localStorage
  const signup = async (
    name: string,
    email: string,
    password: string,
    role: string,
    verificationFile?: File | null,
    admissionYear?: string,
    graduationYear?: string,
    passoutYear?: string,
    personalEmail?: string
  ) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      
      if (role === "student") {
        if (admissionYear) formData.append("admissionYear", admissionYear);
        if (graduationYear) formData.append("graduationYear", graduationYear);
        if (verificationFile) formData.append("studentId", verificationFile);
      }
      
      if (role === "alumni") {
        if (passoutYear) formData.append("passoutYear", passoutYear);
        if (personalEmail) formData.append("personalEmail", personalEmail);
        if (verificationFile) formData.append("studentId", verificationFile);
      }

      const res = await axios.post(`${AUTH_URL}/signup`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if(!res.data.success){
        throw new Error(res.data.error || "Signup")
      }

      // ⭐ CRITICAL FIX: Store token in localStorage
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      }

      if (res.data.user.verificationStatus === "pending") {
        const message =
          role === "alumni"
            ? "✅ Alumni account created! Please wait for admin verification."
            : "✅ Account created! Please wait for admin verification.";
        toast.success(message, { duration: 5000 });
        setCurrentUser(null);
        return;
      }

      setCurrentUser(res.data.user);
      toast.success("🎉 Account created successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Signup failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ⭐ FIXED: Login - Store token in localStorage
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${AUTH_URL}/login`,
        { email, password },
        { withCredentials: true }
      );

      // ⭐ CRITICAL FIX: Store token in localStorage
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        console.log("✅ Token stored in localStorage:", res.data.token);
      }

      setCurrentUser(res.data.user);

      try {
        const fullProfile = await getProfile();
        console.log("Full profile fetched after login :", fullProfile);
      } catch (error) {
        console.error("Profile fetch failed:", error);
        
      }
      toast.success("Logged in successfully!");
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.verificationStatus === "pending") {
        toast.error(
          "⏳ Your account is pending verification. Please wait for admin approval.",
          { duration: 5000 }
        );
      } else if (errorData?.verificationStatus === "rejected") {
        toast.error(
          `❌ Account rejected: ${
            errorData.rejectionReason || "Contact admin for details"
          }`,
          { duration: 6000 }
        );
      } else {
        toast.error(errorData?.error || "Login failed");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ⭐ FIXED: Logout - Remove token from localStorage
  const logout = async () => {
    try {
      await axios.post(`${AUTH_URL}/logout`, {}, { withCredentials: true });
      
      // ⭐ Clear localStorage and axios header
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      
      setCurrentUser(null);
      toast.success("Logged out successfully!");
    } catch {
      // Even if API fails, clear local data
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setCurrentUser(null);
      toast.error("Logout failed");
    }
  };

  // ✅ Get Profile
  const getProfile = async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem("token");
      
      const res = await axios.get(PROFILE_URL, { 
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      setCurrentUser(res.data.user);
      return res.data.user;
    } catch {
      setCurrentUser(null);
      return null;
    }
  };

  // ✅ Update Profile
  const updateProfile = async (data: FormData): Promise<User> => {
    try {
      const token = localStorage.getItem("token");
      
      const res = await axios.put(PROFILE_URL, data, {
        withCredentials: true,
        headers: { 
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` })
        },
      });
      
      setCurrentUser(res.data.user);
      toast.success("Profile updated!");
      return res.data.user;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Profile update failed");
      throw err;
    }
  };

  // ✅ Forgot Password
  const forgotPassword = async (email: string) => {
    try {
      await axios.post(
        `${AUTH_URL}/forgot-password`,
        { email },
        { withCredentials: true }
      );
      toast.success("Reset link sent! Check your email.");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send reset email");
      throw err;
    }
  };

  // ✅ Reset Password
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await axios.post(
        `${AUTH_URL}/reset-password`,
        { token, newPassword },
        { withCredentials: true }
      );
      toast.success("Password reset successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to reset password");
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        signup,
        login,
        logout,
        getProfile,
        updateProfile,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
