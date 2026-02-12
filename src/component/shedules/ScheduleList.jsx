// src/components/ScheduleList.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/API";

export default function ScheduleList() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/schedules", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter out expired or completed schedules before setting state
      const now = new Date();
      const activeSchedules = (res.data.schedules || []).filter((sch) => {
        const isCompleted = sch.status === "done";
        const isExpired =
          sch.expectedCompletionDate &&
          new Date(sch.expectedCompletionDate) < now;
        return !isCompleted && !isExpired;
      });

      setSchedules(activeSchedules);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Upcoming Schedules
      </h2>

      {loading && <p className="text-gray-500">Loading…</p>}
      {!loading && schedules.length === 0 && (
        <p className="text-gray-500">No active schedules found.</p>
      )}

      <ul className="space-y-4">
        {schedules.map((sch) => (
          <li
            key={sch._id}
            className="border border-gray-200 p-4 rounded-lg hover:shadow-sm transition"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">
                {sch.item ? sch.item.name : "Unknown Item"}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  sch.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : sch.status === "done"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {sch.status}
              </span>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Category:</strong> {sch.category}
              </p>
              <p>
                <strong>Scheduled:</strong>{" "}
                {new Date(sch.scheduledDate).toLocaleString()}
              </p>
              {sch.expectedCompletionDate && (
                <p>
                  <strong>Expected Completion:</strong>{" "}
                  {new Date(sch.expectedCompletionDate).toLocaleString()}
                </p>
              )}
              {sch.notificationSent && (
                <p className="text-blue-600 font-medium">
                  🔔 Notification Sent
                </p>
              )}
              {sch.remarks && (
                <p>
                  <strong>Remarks:</strong> {sch.remarks}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
