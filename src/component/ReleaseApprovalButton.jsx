import React, { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import api from "../api/API";

const ReleaseApprovalButton = ({ releaseId, action, onUpdated }) => {
  const [loading, setLoading] = useState(false);

  const allowedActions = ["approved", "cancelled", "pending"];
  if (!allowedActions.includes(action)) {
    console.warn(`ReleaseApprovalButton: unsupported action "${action}"`);
  }

  const handleAction = async () => {
    if (!releaseId || !action) return;
    if (!allowedActions.includes(action)) return;

    setLoading(true);
    try {
      const res = await api.patch(`/release/${releaseId}/status`, {
        approvalStatus: action
      });
      toast.success(res.data.message || `Release ${action} successfully!`);
      if (onUpdated) onUpdated(res.data.release);
    } catch (err) {
      console.error("Release action error:", err);
      toast.error(err.response?.data?.message || "Failed to update release status");
    } finally {
      setLoading(false);
    }
  };

  const label = action.charAt(0).toUpperCase() + action.slice(1);
  const buttonText = loading ? `${label}ing...` : label;

  const actionColors = {
    approved: "bg-green-500 hover:bg-green-600",
    cancelled: "bg-red-500 hover:bg-red-600",
    pending: "bg-yellow-500 hover:bg-yellow-600",
  };

  const colorClass = actionColors[action] || "bg-gray-500 hover:bg-gray-600";

  return (
    <motion.button
      onClick={handleAction}
      whileTap={{ scale: 0.95 }}
      className={`text-white px-4 py-2 rounded transition ${colorClass} ${
        loading ? "opacity-70 cursor-not-allowed" : ""
      }`}
      disabled={loading}
      aria-disabled={loading}
    >
      {buttonText}
    </motion.button>
  );
};
export default ReleaseApprovalButton;