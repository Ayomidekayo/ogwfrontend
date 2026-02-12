import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import ReleaseApprovalButton from "./ReleaseApprovalButton";
import api from "../api/API";

const ReleaseApprovalPanel = ({  onUpdate }) => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get("/release", {
        headers: { Authorization: `Bearer ${token?.trim()}` },
      });
      const allReleases = Array.isArray(res.data.data) ? res.data.data : [];
      const pending = allReleases.filter(
        (r) => r.approvalStatus === "pending" && r.item
      );
      setReleases(pending);
    } catch (err) {
      console.error("❌ Error fetching releases:", err);
      toast.error("Failed to fetch releases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleStatusChange = async () => {
    await fetchReleases();
    if (onUpdate) onUpdate();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-gray-600 font-semibold"
        >
          Loading releases...
        </motion.div>
      </div>
    );
  }

  if (releases.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-4">
        No releases pending approval.
      </p>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Item</th>
              <th className="p-3 text-left">Qty</th>
              <th className="p-3 text-left">Released To</th>
              <th className="p-3 text-left">Released By</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {releases.map((rel) => (
              <motion.tr
                key={rel._id}
                className="border-b hover:bg-gray-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="p-3">{rel.item?.name ?? "Unknown"}</td>
                <td className="p-3">
                  {rel.qtyReleased} {rel.item?.measuringUnit ?? ""}
                </td>
                <td className="p-3">{rel.releasedTo ?? "N/A"}</td>
                <td className="p-3">{rel.releasedBy?.name ?? "N/A"}</td>
                <td className="p-3">
                  {rel.dateReleased
                    ? new Date(rel.dateReleased).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="p-3 font-semibold capitalize">
                  {rel.approvalStatus}
                </td>
                <td className="p-3 flex gap-2 flex-wrap">
                  {["approved", "cancelled"].map((action) => (
                    <ReleaseApprovalButton
                      key={action}
                      releaseId={rel._id}
                      action={action}
                      onUpdated={handleStatusChange}
                    />
                  ))}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden flex flex-col gap-4">
        {releases.map((rel) => (
          <motion.div
            key={rel._id}
            className="bg-white shadow rounded-lg p-4 flex flex-col gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between">
              <span className="font-semibold">{rel.item?.name ?? "Unknown"}</span>
              <span className="text-sm text-gray-500">
                {rel.dateReleased
                  ? new Date(rel.dateReleased).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Qty: {rel.qtyReleased} {rel.item?.measuringUnit ?? ""}</span>
              <span>To: {rel.releasedTo ?? "N/A"}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>By: {rel.releasedBy?.name ?? "N/A"}</span>
              <span className="capitalize font-semibold">{rel.approvalStatus}</span>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              {["approved", "cancelled"].map((action) => (
                <ReleaseApprovalButton
                  key={action}
                  releaseId={rel._id}
                  action={action}
                  onUpdated={handleStatusChange}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReleaseApprovalPanel;
