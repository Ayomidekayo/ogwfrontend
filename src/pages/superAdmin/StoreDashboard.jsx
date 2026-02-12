import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ReleaseApprovalPanel from "../component/ReleaseApprovalPanel";

const API =api;

export default function ReleasePage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("myReleases");
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // ---------------------------
  //   Get Token Helper
  // ---------------------------
  const authHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return { headers: { Authorization: `Bearer ${token.trim()}` } };
  };

  // ---------------------------
  //   Fetch User
  // ---------------------------
  const fetchUser = useCallback(async () => {
    try {
      const config = authHeader();
      if (!config) return toast.error("Please log in again.");

      const res = await axios.get(`${API}/auth/me`, config);
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch user info");
    } finally {
      setUserLoading(false);
    }
  }, []);

  // ---------------------------
  //   Fetch Releases
  // ---------------------------
  const fetchReleases = useCallback(async () => {
    try {
      setLoading(true);
      const config = authHeader();
      if (!config) return;

      const res = await axios.get(`${API}/release`, config);
      const payload = res.data;

      // Normalize response
      const list =
        Array.isArray(payload) ? payload :
        Array.isArray(payload?.data) ? payload.data : [];

      setReleases(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load releases");
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------------------
  //   Load user then releases
  // ---------------------------
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) fetchReleases();
  }, [user, fetchReleases]);

  // ---------------------------
  //   Handle Return Navigation
  // ---------------------------
  const handleReturn = (rel) => {
    const isAdmin = ["admin", "superadmin"].includes(user?.role);
    navigate(`/${isAdmin ? "admin" : "user"}-dashboard/returns/${rel._id}`);
  };

  // ---------------------------
  //   UI States
  // ---------------------------
  if (userLoading)
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Loading user info...
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Unable to load user. Please log in again.
      </div>
    );

  const isSuperAdmin = user.role === "superadmin";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Release Management</h1>
        <p className="text-gray-600">
          Logged in as: <strong>{user.name}</strong> ({user.role})
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {["myReleases", "approvals"].map((tab) =>
          tab === "approvals" && !isSuperAdmin ? null : (
            <button
              key={tab}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "myReleases" ? "My Releases" : "Approval Panel"}
            </button>
          )
        )}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeTab === "myReleases" ? (
          <>
            {/* Loading State */}
            {loading ? (
              <p className="text-center text-gray-500 mt-6">Loading...</p>
            ) : releases.length === 0 ? (
              <p className="text-center text-gray-500 mt-6">No records found.</p>
            ) : (
              <table className="w-full bg-white shadow rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    {["Item", "Quantity", "Released To", "Released By", "Date", "Status", "Actions"].map((h) => (
                      <th key={h} className="p-3 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
               <tbody>
                {releases.map((rel) => {
                  const item = rel.item || {};
                  const unit = item.measuringUnit || "";

                  return (
                    <tr key={rel._id} className="border‑b hover:bg-gray-50">
                      <td className="p-3">{item.name || "—"}</td>
                      <td className="p-3">
                        {rel.qtyReleased} {unit} released<br />
                        {rel.qtyReturned ?? 0} returned<br />
                        {rel.qtyRemaining != null
                          ? `${rel.qtyRemaining} remaining`
                          : ""}
                      </td>
                      <td className="p-3">{rel.releasedTo || "—"}</td>
                      <td className="p-3">{rel.releasedBy?.name || "—"}</td>
                      <td className="p-3">
                        {rel.createdAt
                          ? new Date(rel.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="p-3 capitalize">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          {
                            approved: "bg-green-100 text-green-700",
                            pending: "bg-yellow-100 text-yellow-700",
                            cancelled: "bg-red-100 text-red-700",
                          }[rel.approvalStatus] ||
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {rel.returnStatus || "pending"}
                        </span>
                      </td>
                      <td className="p-3">
                        {rel.isReturnable &&
                        rel.approvalStatus === "approved" &&
                        rel.returnStatus !== "fully returned" ? (
                          <button
                            onClick={() => handleReturn(rel)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Return
                          </button>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              </table>
            )}
          </>
        ) : (
          <ReleaseApprovalPanel user={user} onUpdate={fetchReleases} />
        )}
      </motion.div>
    </div>
  );
}


import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { format } from "date-fns";
import api from "../../api/API";

const ReturnPage = () => {
  const [returns, setReturns] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("date-desc");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch returns from API
  useEffect(() => {
    const fetchReturns = async () => {
      if (!token) {
        console.error("No token found. User not authenticated.");
        setReturns([]);
        setFiltered([]);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/return", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const dataArray = Array.isArray(res.data?.returns)
          ? res.data.returns
          : [];
        setReturns(dataArray);
        setFiltered(dataArray);
      } catch (error) {
        console.error("Error fetching returns:", error);
        setReturns([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [token]);

  // Filter and sort returns
  useEffect(() => {
    let list = [...returns];

    // Filter by search
    if (search.trim()) {
      list = list.filter(
        (r) =>
          r.item?.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.returnedBy?.toLowerCase().includes(search.toLowerCase()) ||
          r.condition?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort options
    switch (sortOption) {
     case "status":  
    list.sort((a, b) => {
      // you can define a custom order for statuses:
      const order = { pending_review: 0, processed: 1, archived: 2 };
      return (order[a.status] ?? 99) - (order[b.status] ?? 99);
    });
    break;

  default:
    break;
    }

    setFiltered(list);
  }, [search, sortOption, returns]);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">Loading Returns...</h2>
        <div className="animate-pulse mt-4 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Returned Items</h1>

      {/* Search + Sort */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-3">
        <input
          type="text"
          placeholder="Search by item, user, or condition..."
          className="border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 w-full md:w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

       <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {/* existing options */}
            <option value="status">Sort by Status</option>
          </select>

      </div>

      {/* Returns Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="px-4 py-2">Item</th>
              <th className="px-4 py-2">Returned By</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Condition</th>
              <th className="px-4 py-2">Date Returned</th>
              <th className="px-4 py-2 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((r) => {
                const expectedReturn = r.expectedReturnBy
                  ? new Date(r.expectedReturnBy)
                  : null;
                const isOverdue = expectedReturn ? new Date() > expectedReturn : false;

                return (
                  <motion.tr
                    key={r._id}
                    
                    className={`cursor-pointer border-b hover:bg-gray-50 ${
                      isOverdue ? "bg-red-50" : ""
                    }`}
                    onClick={() => setSelectedReturn(r)}
                  >
                    <td className="px-4 py-2">{r.item?.name || "N/A"}</td>
                    <td className="px-4 py-2">{r.returnedBy}</td>
                    <td className="px-4 py-2">{r.quantityReturned}</td>
                    <td className="px-4 py-2 capitalize">{r.condition}</td>
                    <td className="px-4 py-2">
                      {format(new Date(r.dateReturned), "MMM d, yyyy")}
                    </td>
                    <td
                      className={`px-4 py-2 text-center font-semibold ${
                        isOverdue ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {isOverdue ? "Overdue" : "Returned"}
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No return records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
    {selectedReturn && (
  <motion.div
    className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative overflow-hidden"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
    >
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        onClick={() => setSelectedReturn(null)}
      >
        ×
      </button>

      <h2 className="text-2xl font-semibold mb-4">
        Return Details – {selectedReturn.item?.name}
      </h2>

      <div className="space-y-3 text-gray-700 max-h-96 overflow-y-auto">
        <p><strong>Returned By:</strong> {selectedReturn.returnedBy}</p>
        <p><strong>Email:</strong> {selectedReturn.returnedByEmail || "N/A"}</p>
        <p><strong>Quantity:</strong> {selectedReturn.quantityReturned}</p>
        <p><strong>Condition:</strong> {selectedReturn.condition}</p>
        <p><strong>Date Returned:</strong> {format(new Date(selectedReturn.dateReturned), "PPpp")}</p>
        <p><strong>Remarks:</strong> {selectedReturn.remarks || "No remarks"}</p>
        <p><strong>Processed By:</strong> {selectedReturn.processedBy?.name || "N/A"}</p>
        <p><strong>Expected Return By:</strong> { selectedReturn.expectedReturnBy ? format(new Date(selectedReturn.expectedReturnBy), "PPpp") : "N/A" }</p>

        {selectedReturn.moreDetails && (
          <div className="mt-4 border-t pt-4">
            <h3 className="text-lg font-medium mb-2">More Details</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {selectedReturn.moreDetails}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 text-right">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          onClick={() => setSelectedReturn(null)}
        >
          Close
        </button>
      </div>
    </motion.div>
  </motion.div>
)}


    </div>
  );
};

export default ReturnPage;

