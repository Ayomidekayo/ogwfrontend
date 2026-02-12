import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import api from "../api/API";


const ReturnHistoryPage = () => {
  const { releaseId } = useParams();  // or itemId, depending on your API
  const navigate = useNavigate();
  const { user } = useAuth();

  const [release, setRelease] = useState(null);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const getConditionBadgeClass = (condition) => {
    switch ((condition || "").toLowerCase()) {
      case "good":
        return "bg-green-100 text-green-800";
      case "damaged":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-yellow-100 text-yellow-800";
      case "lost":
        return "bg-gray-200 text-gray-800";
      case "other":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

useEffect(() => {
  const fetchReturnHistory = async () => {
    try {
      const response = await api.get(`/api/return/release/${releaseId}`);
      console.log("ReturnHistory API response:", response);

      const returnRecords = response.data.data;  // because controller returns { data: [ ... ] }

      setReturns(returnRecords);

      // Optionally: Extract release info from the first return
      if (returnRecords.length > 0) {
        setRelease(returnRecords[0].release);
      }
    } catch (error) {
      console.error("Error fetching return history:", {
        response: error.response,
        message: error.message,
      });
      toast.error("Failed to load return history.");
    } finally {
      setLoading(false);
    }
  };

  fetchReturnHistory();
}, [releaseId]);

  const handleBack = () => {
    // Navigate back to release or admin/user dashboard
    if (user?.role === "superadmin" || user?.role === "admin") {
      navigate("/admin-dashboard/releases");
    } else {
      navigate("/user-dashboard/releases");
    }
  };

  if (loading) {
    return <p className="text-center py-4">Loading return history…</p>;
  }

  if (!release) {
    return (
      <div className="text-center py-4">
        <p>Release record not found.</p>
        <button
          onClick={handleBack}
          className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow rounded-md max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Return History</h1>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Back
        </button>
      </div>

      <div className="mb-4 space-y-2">
        <p>
          <strong>Item:</strong> {release.item?.name}
        </p>
        <p>
          <strong>Released To:</strong> {release.releasedTo}
        </p>
        <p>
          <strong>Qty Released:</strong> {release.qtyReleased} {release.item?.measuringUnit}
        </p>
        <p>
          <strong>Return Status:</strong> {release.returnStatus}
        </p>
        {release.qtyRemaining ?(<p>
          <strong>Remaining Item:</strong> {release.qtyRemaining} {release.item?.measuringUnit}
        </p>): null}
        
      </div> 

      <div>
        <h2 className="text-xl font-semibold mb-2">Returns</h2>
        {returns.length === 0 ? (
          <p>No return records found for this release.</p>
        ) : (
          <table className="min-w-full bg-gray-50 border rounded-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Returned By</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Condition</th>
                <th className="px-4 py-2">Date Returned</th>
                <th className="px-4 py-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="px-4 py-2">
                    {r.returnedBy || r.returnedByEmail || "Unknown"}
                  </td>
                  <td className="px-4 py-2">
                    {r.quantityReturned} {release.item?.measuringUnit}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${getConditionBadgeClass(
                        r.condition
                      )}`}
                    >
                      {r.condition}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(r.dateReturned).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{r.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReturnHistoryPage;
