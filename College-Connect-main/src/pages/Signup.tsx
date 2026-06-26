import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Upload,
  X,
  FileText,
  Calendar,
  GraduationCap,
  Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const Signup = () => {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: "student" | "alumni"; // Explicitly typed
    admissionYear: string;
    graduationYear: string;
    passoutYear: string; // ✅ For alumni
    personalEmail: string; // ✅ For alumni
  }>({
    name: "",
    email: "",
    password: "",
    role: "student", // ✅ Can be 'student' or 'alumni'
    admissionYear: new Date().getFullYear().toString(),
    graduationYear: "",
    passoutYear: "", // ✅ For alumni
    personalEmail: "", // ✅ For alumni
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState("");
  const [fileError, setFileError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(false);

  const navigate = useNavigate();
  const { signup } = useAuth();

  // College email domains (for students only)
  const allowedColleges = ["kiet.edu", "abc.edu", "xyz.edu"];

  // Generate year options
  const currentYear = new Date().getFullYear();
  const admissionYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const graduationYears = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const passoutYears = Array.from({ length: 50 }, (_, i) => currentYear - i);

  interface PasswordStrength {
    strength: string;
    color: string;
  }

  const getPasswordStrength = (password: string): PasswordStrength => {
    if (password.length === 0) return { strength: "", color: "" };
    if (password.length < 6) return { strength: "Weak", color: "text-red-500" };
    if (password.length < 10)
      return { strength: "Medium", color: "text-yellow-500" };
    return { strength: "Strong", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  interface EmailChangeEvent {
    target: {
      value: string;
    };
  }

  interface EmailValidator {
    test: (email: string) => boolean;
  }

  const handleEmailChange = (e: EmailChangeEvent): void => {
    const email: string = e.target.value;
    setFormData({ ...formData, email });

    const emailRegex: EmailValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // ✅ Only check domain for students
    if (formData.role === "student" && email.includes("@")) {
      const domain: string = email.split("@")[1].toLowerCase();
      setEmailError(
        !allowedColleges.includes(domain)
          ? "Use a valid college email address"
          : ""
      );
    } else {
      setEmailError("");
    }
  };

  interface PasswordChangeEvent {
    target: {
      value: string;
    };
  }

  const handlePasswordChange = (e: PasswordChangeEvent): void => {
    const password: string = e.target.value;
    setFormData({ ...formData, password });
    setPasswordError(
      password.length < 6 ? "Password must be at least 6 characters" : ""
    );
  };

  interface FileChangeEvent {
    target: {
      files: FileList | null;
    };
  }

  const handleFileChange = (e: FileChangeEvent): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(true);

    const allowedTypes: string[] = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFileError("Only JPG, PNG, and PDF files are allowed");
      setVerificationFile(null);
      setUploadProgress(false);
      return;
    }

    const maxSize: number = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError("File size must be less than 5MB");
      setVerificationFile(null);
      setUploadProgress(false);
      return;
    }

    setFileError("");
    setVerificationFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFilePreview(reader.result.toString());
        }
        setUploadProgress(false);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview("");
      setUploadProgress(false);
    }
  };

  const removeFile = () => {
    setVerificationFile(null);
    setFilePreview("");
    setFileError("");
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) (fileInput as HTMLInputElement).value = "";
  };

  interface RoleChangeEvent {
    role: "student" | "alumni";
  }

  const handleRoleChange = (role: RoleChangeEvent["role"]) => {
    setFormData({
      ...formData,
      role,
      email: "", // Reset email when switching roles
      graduationYear: "",
      passoutYear: "",
      personalEmail: "",
    });
    setEmailError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handle submit triggered");
    

    if (emailError || passwordError || fileError) {
      alert("Please fix the errors before submitting");
      return;
    }

    if (!verificationFile) {
      alert(
        formData.role === "alumni"
          ? "Please upload your degree certificate or alumni ID"
          : "Please upload your student ID card"
      );
      return;
    }

    if (formData.role === "student" && !formData.graduationYear) {
      alert("Please select your expected graduation year");
      return;
    }

    if (formData.role === "alumni" && !formData.passoutYear) {
      alert("Please select your passout year");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Starting signup....");

      await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        verificationFile,
        formData.admissionYear,
        formData.graduationYear,
        formData.passoutYear,
        formData.personalEmail
      );
      console.log("Signup resolved - navigating....");
      toast.success("Signup successful! Please wait for admin verification.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("🔴 Signup error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again."
      );
    } finally {
      console.log("Signup finished , turnof loading");
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full sm:max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Create Account
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              Join the college community
            </p>
          </div>

          {/* ✅ NEW: Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange("student")}
                className={`flex items-center justify-center px-4 py-3 border-2 rounded-xl transition-all ${
                  formData.role === "student"
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                disabled={isSubmitting}
              >
                <Users className="w-5 h-5 mr-2" />
                <span className="font-medium">Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("alumni")}
                className={`flex items-center justify-center px-4 py-3 border-2 rounded-xl transition-all ${
                  formData.role === "alumni"
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                disabled={isSubmitting}
              >
                <GraduationCap className="w-5 h-5 mr-2" />
                <span className="font-medium">Alumni</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute inset-y-0 left-3 my-auto text-gray-400 h-5 w-5" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter your full name"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {formData.role === "student"
                  ? "College Email"
                  : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute inset-y-0 left-3 my-auto text-gray-400 h-5 w-5" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  className="pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder={
                    formData.role === "student"
                      ? "you@college.edu"
                      : "your@email.com"
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* ✅ Alumni Personal Email */}
            {formData.role === "alumni" && (
              <div>
                <label
                  htmlFor="personalEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Personal Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute inset-y-0 left-3 my-auto text-gray-400 h-5 w-5" />
                  <input
                    id="personalEmail"
                    type="email"
                    value={formData.personalEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalEmail: e.target.value,
                      })
                    }
                    className="pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="personal@email.com"
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Provide a personal email to stay connected after graduation
                </p>
              </div>
            )}

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute inset-y-0 left-3 my-auto text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className="pl-10 pr-12 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Create a password"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 my-auto text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex justify-between items-center mt-1">
                {passwordError && (
                  <p className="text-red-500 text-sm">{passwordError}</p>
                )}
                {!passwordError && passwordStrength.strength && (
                  <p className={`text-sm ${passwordStrength.color}`}>
                    {passwordStrength.strength}
                  </p>
                )}
              </div>
            </div>

            {/* ✅ Student Years */}
            {formData.role === "student" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="admissionYear"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Admission Year
                  </label>
                  <div className="relative">
                    <Calendar className="absolute inset-y-0 left-3 my-auto text-gray-400 h-5 w-5" />
                    <select
                      id="admissionYear"
                      value={formData.admissionYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          admissionYear: e.target.value,
                        })
                      }
                      className="pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                      disabled={isSubmitting}
                    >
                      {admissionYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="graduationYear"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Expected Graduation
                  </label>
                  <div className="relative">
                    <Calendar className="absolute inset-y-0 left-3 my-auto text-gray-400 h-5 w-5" />
                    <select
                      id="graduationYear"
                      value={formData.graduationYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          graduationYear: e.target.value,
                        })
                      }
                      className="pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select Year</option>
                      {graduationYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ Alumni Passout Year */}
            {formData.role === "alumni" && (
              <div>
                <label
                  htmlFor="passoutYear"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Passout/Graduation Year
                </label>
                <div className="relative">
                  <Calendar className="absolute inset-y-0 left-3 my-auto text-gray-400 h-5 w-5" />
                  <select
                    id="passoutYear"
                    value={formData.passoutYear}
                    onChange={(e) =>
                      setFormData({ ...formData, passoutYear: e.target.value })
                    }
                    className="pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select Year</option>
                    {passoutYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div
              className={`${
                formData.role === "student"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-green-50 border-green-200"
              } border rounded-xl p-4`}
            >
              <p className="text-sm font-medium">
                {formData.role === "student" ? (
                  <>
                    <span className="text-blue-800">📚 Students:</span>
                    <span className="text-blue-700">
                      {" "}
                      Your role will auto-update to Senior in 4th year and
                      Alumni after graduation.
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-green-800">🎓 Alumni:</span>
                    <span className="text-green-700">
                      {" "}
                      Welcome back! Verify your alumni status to reconnect with
                      the community.
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.role === "student"
                  ? "Student ID Card"
                  : "Degree Certificate / Alumni ID"}
                <span className="text-red-500"> *</span>
              </label>
              {!verificationFile ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG or PDF (Max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                </label>
              ) : (
                <div
                  className={`relative border-2 rounded-xl p-4 ${
                    formData.role === "student"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-green-500 bg-green-50"
                  }`}
                >
                  <button
                    title="remove"
                    type="button"
                    onClick={removeFile}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {uploadProgress ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : filePreview ? (
                    <img
                      src={filePreview}
                      alt="File preview"
                      className="w-full h-48 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-24">
                      <FileText className="w-12 h-12 text-indigo-600" />
                      <span className="ml-2 text-sm text-gray-700 font-medium">
                        {verificationFile.name}
                      </span>
                    </div>
                  )}
                  <p className="text-center text-xs text-green-600 font-medium mt-2">
                    ✓ File uploaded successfully
                  </p>
                </div>
              )}
              {fileError && (
                <p className="text-red-500 text-sm mt-1">{fileError}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Your account will be verified by admin within 24-48 hours
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full py-3 px-4 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${
                formData.role === "student"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={
                isSubmitting ||
                emailError !== "" ||
                passwordError !== "" ||
                fileError !== ""
              }
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
