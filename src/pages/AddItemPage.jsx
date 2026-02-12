import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../api/API";

const MEASURING_UNITS = [
  "piece", "pack", "bundle", "carton", "crate", "roll", "litre",
  "kilogram", "gram", "meter", "box", "container", "bag", "set",
  "pair", "sheet", "tube", "unit", "pallet"
];

const AddItemPage = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    measuringUnit: "",
    quantity: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      toast.error("Session expired. Please log in again.");
      navigate("/login");
      return;
    }
    // loading done
    setLoading(false);
  }, [token, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.measuringUnit) newErrors.measuringUnit = "Measuring unit is required";
    if (form.quantity === "" || form.quantity == null) newErrors.quantity = "Quantity is required";
    else if (isNaN(Number(form.quantity))) newErrors.quantity = "Quantity must be a number";
    else if (Number(form.quantity) < 0) newErrors.quantity = "Quantity cannot be negative";
    if (!form.description.trim()) newErrors.description = "Description is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    // Redirect back
    if (user?.role === "superadmin" || user?.role === "admin") {
      navigate("/admin-dashboard/items");
    } else {
      navigate("/user-dashboard/items");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const payload = { ...form, category: "stored" };
      const res = await api.post("/item/add", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.message || "Item added successfully!");
      handleCancel();
    } catch (err) {
      console.error("Add item error:", err);
      const msg = err.response?.data?.message || "Failed to add item.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading…</p></div>;
  }

  return (
    <motion.div
      className="max-w-xl mx-auto p-6 bg-white shadow rounded mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-bold mb-4">Add New Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            type="text"
            className="w-full border p-2 rounded"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <label className="block font-medium">Measuring Unit *</label>
          <select
            name="measuringUnit"
            value={form.measuringUnit}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="" disabled>Select measuring unit</option>
            {MEASURING_UNITS.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
          {errors.measuringUnit && <p className="text-red-500 text-sm">{errors.measuringUnit}</p>}
        </div>

        <div>
          <label className="block font-medium">Quantity *</label>
          <input
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            type="number"
            min="0"
            className="w-full border p-2 rounded"
          />
          {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
        </div>

        <div>
          <label className="block font-medium">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 px-4 py-2 rounded text-white ${
              isSubmitting ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? "Adding..." : "Add Item"}
          </button>
          <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-700">Cancel</button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddItemPage;
