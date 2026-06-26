import { useEffect, useState } from "react";
import {
  X,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  Image as ImageIcon,
  Search,
  Filter,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config/apiConfig";

interface Hackathon {
  _id?: string;
  title: string;
  description: string;
  image?: string;
  startDate: string;
  endDate: string;
  location: string;
  type: string;
  organizerName: string;
  organizerEmail: string;
  prizes: string;
  expectedParticipants: string;
  registrationDeadline: string;
  websiteUrl: string;
  tags: string;
  requirements: string;
  registeredUsers?: any[];
}

function ManageHackathons() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [filteredHackathons, setFilteredHackathons] = useState<Hackathon[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentHackathon, setCurrentHackathon] = useState<Hackathon | null>(
    null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const API_URL = API_BASE_URL;

  const emptyForm: Hackathon = {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    type: "In-Person",
    organizerName: "",
    organizerEmail: "",
    prizes: "",
    expectedParticipants: "",
    registrationDeadline: "",
    websiteUrl: "",
    tags: "",
    requirements: "",
  };

  const [form, setForm] = useState<Hackathon>(emptyForm);

  useEffect(() => {
    fetchHackathons();
  }, []);

  useEffect(() => {
    filterHackathons();
  }, [searchQuery, typeFilter, hackathons]);

  const filterHackathons = () => {
    let filtered = [...hackathons];

    if (searchQuery) {
      filtered = filtered.filter(
        (h) =>
          h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((h) => h.type === typeFilter);
    }

    setFilteredHackathons(filtered);
  };

  const fetchHackathons = async () => {
    try {
      const res = await axios.get(`${API_URL}/hackathons`, {
        withCredentials: true,
      });
      setHackathons(res.data.hackathons);
    } catch {
      toast.error("Failed to load hackathons");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      const editableFields = {
        title: form.title,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        location: form.location,
        type: form.type,
        organizerName: form.organizerName,
        organizerEmail: form.organizerEmail,
        prizes: form.prizes,
        expectedParticipants: form.expectedParticipants,
        registrationDeadline: form.registrationDeadline,
        websiteUrl: form.websiteUrl,
        tags: form.tags,
        requirements: form.requirements,
      };

      Object.entries(editableFields).forEach(([key, value]) => {
        if (value && value.trim() !== "") formData.append(key, value);
      });

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editMode && currentHackathon?._id) {
        await axios.put(
          `${API_URL}/hackathons/${currentHackathon._id}`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("✅ Hackathon updated successfully!");
      } else {
        await axios.post(`${API_URL}/hackathons`, formData, {
          withCredentials: true,
          headers:{
            'Content-Type':"multipart/form-data"
          }
        });
        toast.success("✅ Hackathon created successfully!");
      }

      closeModal();
      fetchHackathons();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hackathon: any) => {
    setEditMode(true);
    setCurrentHackathon(hackathon);
    setForm({
      ...hackathon,
      startDate: hackathon.startDate.split("T")[0],
      endDate: hackathon.endDate.split("T")[0],
      registrationDeadline: hackathon.registrationDeadline?.split("T")[0] || "",
      tags: hackathon.tags.join(", "),
    });
    setImagePreview(hackathon.image || "");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hackathon?")) return;

    try {
      await axios.delete(`${API_URL}/hackathons/${id}`, {
        withCredentials: true,
      });
      toast.success("Hackathon deleted successfully");
      fetchHackathons();
    } catch {
      toast.error("Failed to delete hackathon");
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentHackathon(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview("");
    setEditMode(false);
    setCurrentHackathon(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Manage Hackathons
            </h1>
            <p className="text-gray-600 mt-2">
              Add, edit, or remove hackathons from the platform
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Hackathon
          </button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hackathons</p>
                <p className="text-3xl font-bold text-gray-900">
                  {hackathons.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-3xl font-bold text-gray-900">
                  {
                    hackathons.filter((h) => new Date(h.startDate) > new Date())
                      .length
                  }
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Registrations</p>
                <p className="text-3xl font-bold text-gray-900">
                  {hackathons.reduce(
                    (sum, h) => sum + (h.registeredUsers?.length || 0),
                    0
                  )}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow p-4 space-y-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search hackathons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                showFilters
                  ? "bg-indigo-600 text-white"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2"
              >
                {["all", "In-Person", "Online", "Hybrid"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      typeFilter === type
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {type === "all" ? "All Types" : type}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Hackathons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredHackathons.map((h, index) => (
              <motion.div
                key={h._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                  {h.image ? (
                    <img
                      src={h.image}
                      alt={h.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-16 w-16 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        h.type === "Online"
                          ? "bg-green-500"
                          : h.type === "Hybrid"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                      } text-white`}
                    >
                      {h.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {h.title}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      <span>{new Date(h.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-indigo-600" />
                      <span className="line-clamp-1">{h.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-600" />
                      <span>{h.registeredUsers?.length || 0} registered</span>
                    </div>
                  </div>

                  {h.prizes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                      <p className="text-sm font-semibold text-yellow-800">
                        💰 Prize: {h.prizes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    {h.websiteUrl && (
                      <a
                        href={h.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Visit
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(h)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(h._id!)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredHackathons.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow p-12 text-center"
          >
            <Calendar className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {hackathons.length === 0
                ? "No Hackathons Yet"
                : "No Results Found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {hackathons.length === 0
                ? "Start by adding your first hackathon"
                : "Try adjusting your search or filters"}
            </p>
            {hackathons.length === 0 && (
              <button
                onClick={openAddModal}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Add First Hackathon
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editMode ? "Edit Hackathon" : "Add New Hackathon"}
                </h2>
                <button
                  title="closeModal"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
              >
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hackathon Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-indigo-500 transition-colors">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          title="Image preview"
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview("");
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                        <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Click to upload image
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PNG, JPG up to 5MB
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      required
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., TechFest 2024"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      required
                      rows={3}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Describe the hackathon..."
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      title="start date"
                      type="date"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm({ ...form, startDate: e.target.value })
                      }
                      required
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      title="end date"
                      type="date"
                      value={form.endDate}
                      onChange={(e) =>
                        setForm({ ...form, endDate: e.target.value })
                      }
                      required
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      required
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., New Delhi"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      title="form type "
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="In-Person">In-Person</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  {/* Prizes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prizes
                    </label>
                    <input
                      type="text"
                      value={form.prizes}
                      onChange={(e) =>
                        setForm({ ...form, prizes: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., $5000"
                    />
                  </div>

                  {/* Expected Participants */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expected Participants
                    </label>
                    <input
                      type="text"
                      value={form.expectedParticipants}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          expectedParticipants: e.target.value,
                        })
                      }
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 500+"
                    />
                  </div>

                  {/* Website URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={form.websiteUrl}
                      onChange={(e) =>
                        setForm({ ...form, websiteUrl: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Tags */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={form.tags}
                      onChange={(e) =>
                        setForm({ ...form, tags: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                      placeholder="AI, Web3, Mobile"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-medium"
                  >
                    {loading ? "Saving..." : editMode ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageHackathons;
