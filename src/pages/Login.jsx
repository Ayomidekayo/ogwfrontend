import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/API";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting login:", formData);

      const res = await api.post(
        "/auth/login",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Login response:", res.data);

      if (res.data?.user && res.data?.token) {
        login(res.data.user, res.data.token);
        toast.success("Login successful!");

        // Navigate based on role
        if (["admin", "superadmin"].includes(res.data.user.role)) {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } else {
        toast.error("Login failed: Invalid server response.");
      }
    } catch (err) {
      console.error("Login error:", err.response || err);
      toast.error(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6">
      <Toaster />
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 md:p-10 w-full max-w-sm sm:max-w-md md:max-w-lg"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 text-center mb-6">
          Welcome Back
        </h1>

        <div className="mb-4">
          <label className="block text-gray-600 mb-2 text-sm sm:text-base">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 text-sm sm:text-base"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 mb-2 text-sm sm:text-base">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 text-sm sm:text-base"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="text-center mt-4 text-gray-500 text-sm sm:text-base">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;
