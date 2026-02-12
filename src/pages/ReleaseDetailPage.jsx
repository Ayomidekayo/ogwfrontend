import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../api/API";

const ReleaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const RETURNABLE_CATEGORIES = ["repair", "refill", "replace", "borrow"];

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // new state for form submission
const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    releaseQuantity: "",
    releasedTo: "",
    category: "",
    reason: "",
    isReturnable: true,
    expectedReturnBy: "",
    remarks: "",
  });

  useEffect(() => {
    if (!token) {
      toast.error("Session expired. Please log in again.");
      navigate("/login");
      return;
    }

    const fetchItemDetails = async () => {
      try {
        const res = await api.get(`/item/${id}`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
        });
        setItem(res.data.item);
      } catch (err) {
        console.error("Error fetching item details:", err);
        toast.error("Failed to load item details.");
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id, token, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "category") {
        if (RETURNABLE_CATEGORIES.includes(value)) {
          next.isReturnable = true;
        } else {
          next.isReturnable = false;
          next.expectedReturnBy = "";
        }
      }

      if (name === "releaseQuantity" && item) {
        const num = Number(value);
        if (num > item.quantity) {
          toast.warning(
            `Cannot release more than ${item.quantity} ${item.measuringUnit}(s).`
          );
          next.releaseQuantity = item.quantity.toString();
        } else if (num < 1) {
          next.releaseQuantity = "1";
        }
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!item) {
      toast.error("Item details not loaded yet.");
      return;
    }

    const qtyReleased = Number(formData.releaseQuantity);
    if (isNaN(qtyReleased) || qtyReleased < 1) {
      toast.error("Please enter a valid release quantity.");
      return;
    }

    if (qtyReleased > item.quantity) {
      toast.error(
        `Cannot release more than ${item.quantity} ${item.measuringUnit}(s).`
      );
      return;
    }

    const releasedTo = formData.releasedTo.trim();
    if (!releasedTo) {
      toast.error("Please enter the recipient of the item.");
      return;
    }
   const expected = formData.expectedReturnBy;
if (formData.isReturnable && expected) {
  if (new Date(expected) < new Date(today)) {
    toast.error("Expected return date cannot be in the past.");
    return;
  }
}
    const reason = formData.reason.trim();
    if (!reason) {
      toast.error("Please provide a reason for release.");
      return;
    }

    const payload = {
      qtyReleased,
      releasedTo,
      category: formData.category,
      reason,
      isReturnable: formData.isReturnable,
      expectedReturnBy:
        formData.isReturnable && formData.expectedReturnBy
          ? new Date(formData.expectedReturnBy).toISOString()
          : null,
      remarks: formData.remarks.trim(),
    };

    try {
      setSubmitting(true);

      const resp = await api.post(
        `/item/release/${item._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(resp.data.message || "Item released successfully!");

      // Reset form
      setFormData({
        releaseQuantity: "",
        releasedTo: "",
        category: "repair",
        reason: "",
        isReturnable: true,
        expectedReturnBy: "",
        remarks: "",
      });

      // Navigate back to items list
      if (user?.role === "superadmin" || user?.role === "admin") {
        navigate("/admin-dashboard/items");
      } else {
        navigate("/user-dashboard/items");
      }
    } catch (error) {
      console.error("❌ Release error:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          "Server error. Please check your input or connection."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        <h2 className="text-xl font-semibold mb-4">Loading item details...</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6 text-center text-red-600">
        <h2 className="text-xl font-semibold">Item not found.</h2>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Item Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow rounded-lg p-6 border"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{item.name}</h2>
          <button
            onClick={() =>
              (user?.role === "superadmin" || user?.role === "admin")
                ? navigate("/admin-dashboard/items")
                : navigate("/user-dashboard/items")
            }
            className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md shadow-sm hover:bg-gray-300 transition-colors"
          >
            Back to Items List
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
          <div>
            <p>
              <span className="font-semibold">Name:</span> {item.name}
            </p>
            <p>
              <span className="font-semibold">Category:</span> {item.category}
            </p>
            <p>
              <span className="font-semibold">Unit:</span> {item.measuringUnit}
            </p>
            <p>
              <span className="font-semibold">Quantity Available:</span>{" "}
              {item.quantity}
            </p>
          </div>
          <div>
            <p>
              <span className="font-semibold">Refundable:</span>{" "}
              {item.isRefundable ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {item.currentStatus}
            </p>
            <p>
              <span className="font-semibold">Date Added:</span>{" "}
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
            <p>
              <span className="font-semibold">Last Updated:</span>{" "}
              {new Date(item.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Release Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white shadow rounded-lg p-6 border"
      >
        <h2 className="text-2xl font-bold mb-4">Release Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Release Quantity */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Release Quantity:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="releaseQuantity"
                min="1"
                max={item.quantity}
                value={formData.releaseQuantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={submitting}
              />
              <span className="text-gray-700">{item.measuringUnit}</span>
            </div>
          </div>

          {/* Released To */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Released To:
            </label>
            <input
              type="text"
              name="releasedTo"
              value={formData.releasedTo}
              onChange={handleChange}
              placeholder="Enter recipient"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={submitting}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Category:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={submitting}
            >
              <option value="" disabled>Select measuring unit</option>
              <option value="repair">Repair</option>
              <option value="refill">Refill</option>
              <option value="replace">Replace</option>
              <option value="borrow">Borrow</option>
              <option value="consumed">Consumed</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Reason for Release:
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Enter reason"
              rows={4}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={submitting}
            />
          </div>

          {/* Is Returnable */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isReturnable"
              name="isReturnable"
              checked={formData.isReturnable}
              onChange={handleChange}
              disabled={
                !RETURNABLE_CATEGORIES.includes(formData.category) || submitting
              }
              className="w-4 h-4"
            />
            <label htmlFor="isReturnable" className="text-gray-700 font-medium">
              Is this item returnable?
            </label>
          </div>

          {/* Expected Return By */}
        {formData.isReturnable && (
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Expected Return By:
            </label>
            <input
              type="date"
              name="expectedReturnBy"
              value={formData.expectedReturnBy}
              min={today}  // **this ensures the date cannot be less than today**
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
              required={formData.isReturnable} // make it required if returnable
            />
          </div>
        )}

          {/* Remarks */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Remarks (optional):
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Any additional notes..."
              rows={2}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              className={`bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600 transition ${
                submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={submitting}
            >
              {submitting ? "Submitting Release..." : "Submit Release"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ReleaseDetailPage;
