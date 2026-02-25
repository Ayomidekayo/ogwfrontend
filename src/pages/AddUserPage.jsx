import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/API";

const AddUserPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Only superadmin should be able to access
  if (user?.role !== "superadmin") {
    // Optionally redirect or show "Not authorized"
    navigate("admin-dashboard/users");
  }

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
    confirmPassword: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const { name, email, role, password, confirmPassword } = formData;
    if (!name || !email || !role || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    // You can add more validation here (regex for email, password strength, etc)
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await api.post(
        "/api/user",
        {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(res.data.message || "User created successfully");
     navigate("/admin-dashboard/users", { replace: true });
    } catch (err) {
      console.error("Add user error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Add New User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Role */}
        <div>
          <label className="block font-medium">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>

        {/* Password */}
        <div>
          <label className="block font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block font-medium">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded text-white ${
              submitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitting ? "Creating…" : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserPage;
