import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "flowbite-react";
import ReleaseApprovalPanel from "../component/ReleaseApprovalPanel";
import api from "../api/API";

const API = api;

export default function ReleasePage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("myReleases");
  const [releases, setReleases] = useState([]);
  const [filteredReleases, setFilteredReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredReleases.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredReleases.length / recordsPerPage);

  const authHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return { headers: { Authorization: `Bearer ${token.trim()}` } };
  };

  const fetchUser = useCallback(async () => {
    try {
      const config = authHeader();
      if (!config) {
        toast.error("Please log in again.");
        return;
      }
      const res = await api.get("/api/auth/me", config);
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch user info");
    } finally {
      setUserLoading(false);
    }
  }, []);

  const fetchReleases = useCallback(async () => {
    try {
      setLoading(true);
      const config = authHeader();
      if (!config) return;

      const res = await api.get(`/api/release`, config);
      const payload = res.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];
      setReleases(list);
      setFilteredReleases(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load releases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) fetchReleases();
  }, [user, fetchReleases]);

  const handleReturn = (rel) => {
    const isAdmin = ["admin", "superadmin"].includes(user?.role);
    navigate(`/${isAdmin ? "admin" : "user"}-dashboard/returns/${rel._id}`);
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredReleases(releases);
      return;
    }
    const lower = searchQuery.toLowerCase();
    const filtered = releases.filter((rel) => {
      const itemName = rel.item?.name?.toLowerCase() || "";
      const releasedTo = (rel.releasedTo || "").toLowerCase();
      const releasedBy = (rel.releasedBy?.name || "").toLowerCase();
      const status = (rel.approvalStatus || "").toLowerCase();
      return (
        itemName.includes(lower) ||
        releasedTo.includes(lower) ||
        releasedBy.includes(lower) ||
        status.includes(lower)
      );
    });
    setFilteredReleases(filtered);
    setCurrentPage(1);
  }, [searchQuery, releases]);

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        Loading user info...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Unable to load user. Please log in again.
      </div>
    );
  }

  const isSuperAdmin = user.role === "superadmin";

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Release Management</h1>
        <p className="text-gray-600 text-sm md:text-base">
          Logged in as: <strong>{user.name}</strong> ({user.role})
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-3 md:gap-4 mb-6 flex-wrap">
        {["myReleases", "approvals"].map((tab) =>
          tab === "approvals" && !isSuperAdmin ? null : (
            <button
              key={tab}
              className={`px-4 py-2 rounded-md text-sm md:text-base font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "myReleases" ? "My Releases" : "Approval Panel"}
            </button>
          )
        )}
      </div>

      {/* Search bar */}
      {activeTab === "myReleases" && (
        <div className="max-w-md mx-auto mb-4 px-2">
          <input
            type="text"
            placeholder="Search by item, status, Released By, etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      )}

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeTab === "myReleases" ? (
          <>
            {loading ? (
              <p className="text-center text-gray-500 mt-6">Loading...</p>
            ) : filteredReleases.length === 0 ? (
              <p className="text-center text-gray-500 mt-6">No records found.</p>
            ) : (
              <div className="space-y-4 md:overflow-x-auto">
                {/* MOBILE CARDS */}
                <div className="md:hidden space-y-4">
                  {currentRecords.map((rel) => {
                    const item = rel.item || {};
                    const unit = item.measuringUnit || "";
                    const fullyReturned = rel.returnStatus === "fully returned";
                    const partiallyReturned = rel.qtyReturned && rel.qtyReturned > 0 && !fullyReturned;

                    return (
                      <motion.div
                        key={rel._id}
                        className="bg-white p-4 shadow rounded-lg flex flex-col space-y-3"
                      >
                        <div>
                          <p><strong>Item:</strong> {item.name || "—"}</p>
                          <p><strong>Released To:</strong> {rel.releasedTo || "—"}</p>
                          <p><strong>Quantity:</strong> {rel.qtyReleased} {unit}</p>
                          <p><strong>Returned:</strong> {rel.qtyReturned ?? 0} / {rel.qtyReleased}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              {
                                approved: "bg-green-100 text-green-700",
                                pending: "bg-yellow-100 text-yellow-700",
                                cancelled: "bg-red-100 text-red-700",
                              }[rel.approvalStatus] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {rel.approvalStatus}
                          </span>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            {isSuperAdmin && rel.approvalStatus === "pending" && (
                              <button className="group relative px-3 py-1 bg-yellow-500 text-white rounded text-xs">
                                Review
                                <Tooltip
                                  content="Review in progress"
                                  style="light"
                                  placement="top"
                                >
                                  <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100" />
                                </Tooltip>
                              </button>
                            )}

                            {rel.isReturnable && rel.approvalStatus === "approved" && (
                              <>
                                <button
                                  onClick={() => handleReturn(rel)}
                                  disabled={fullyReturned}
                                  className={`group relative px-3 py-1 rounded text-xs ${
                                    fullyReturned
                                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                      : "bg-green-600 text-white hover:bg-green-700"
                                  }`}
                                >
                                  {fullyReturned
                                    ? "Returned"
                                    : partiallyReturned
                                    ? "Return More"
                                    : "Return"}
                                  <Tooltip
                                    content={
                                      fullyReturned
                                        ? "Item completely returned"
                                        : partiallyReturned
                                        ? "More items to be returned"
                                        : "Return this item"
                                    }
                                    style="light"
                                    placement="top"
                                  >
                                    <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100" />
                                  </Tooltip>
                                </button>

                                {fullyReturned && (
                                  <button
                                    onClick={() =>
                                      navigate(`/${isSuperAdmin ? "admin" : "user"}-dashboard/returns-details/${rel._id}`)
                                    }
                                    className="group relative px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs"
                                  >
                                    View History
                                    <Tooltip
                                      content="View full return history for this release"
                                      style="light"
                                      placement="top"
                                    >
                                      <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100" />
                                    </Tooltip>
                                  </button>
                                )}
                              </>
                            )}

                            {rel.approvalStatus === "pending" && !isSuperAdmin && (
                              <span className="group relative inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                Reviewing
                                <Tooltip
                                  content="Your release is being reviewed"
                                  style="light"
                                  placement="top"
                                >
                                  <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100" />
                                </Tooltip>
                              </span>
                            )}

                            {(!rel.isReturnable || rel.approvalStatus === "cancelled") && (
                              <span className="group relative inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                Not returnable
                                <Tooltip
                                  content="This release cannot be returned"
                                  style="light"
                                  placement="top"
                                >
                                  <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100" />
                                </Tooltip>
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm bg-white">
                  <table className="w-full text-sm md:text-base">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="p-3 text-left">Item</th>
                        <th className="p-3 text-left">Quantity</th>
                        <th className="p-3 text-left">Released To</th>
                        <th className="p-3 text-left">Released By</th>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((rel) => {
                        const item = rel.item || {};
                        const unit = item.measuringUnit || "";
                        const fullyReturned = rel.returnStatus === "fully returned";
                        const partiallyReturned = rel.qtyReturned && rel.qtyReturned > 0 && !fullyReturned;

                        return (
                          <tr key={rel._id} className="border-b hover:bg-gray-50 transition">
                            <td className="p-3">{item.name || "—"}</td>
                            <td className="p-3 whitespace-nowrap">
                              {rel.qtyReleased} {unit} released<br />
                              {rel.qtyReturned ?? 0} returned<br />
                              {rel.qtyRemaining != null ? `${rel.qtyRemaining} remaining` : ""}
                            </td>
                            <td className="p-3">{rel.releasedTo || "—"}</td>
                            <td className ="p-3">{rel.releasedBy?.name || "—"}</td>
                            <td className="p-3 whitespace-nowrap">
                              {rel.createdAt ? new Date(rel.createdAt).toLocaleDateString() : "—"}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                {
                                  approved: "bg-green-100 text-green-700",
                                  pending: "bg-yellow-100 text-yellow-700",
                                  cancelled: "bg-red-100 text-red-700",
                                }[rel.approvalStatus] ?? "bg-gray-100 text-gray-600"
                              }`}>
                                {rel.approvalStatus}
                              </span>
                            </td>

                            <td className="p-3 flex flex-wrap gap-2">
                              {isSuperAdmin && rel.approvalStatus === "pending" && (
                                <button className="group relative px-3 py-1 bg-yellow-500 text-white rounded text-xs">
                                  Review
                                  <Tooltip
                                    content="Review in progress"
                                    style="light"
                                    placement="top"
                                  >
                                    <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100" />
                                  </Tooltip>
                                </button>
                              )}

                              {rel.isReturnable && rel.approvalStatus === "approved" && (
                                <>
                                  <button
                                    onClick={() => handleReturn(rel)}
                                    disabled={fullyReturned}
                                    className={`group relative px-3 py-1 rounded text-xs ${
                                      fullyReturned
                                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                        : "bg-green-600 text-white hover:bg-green-700"
                                    }`}
                                  >
                                    {fullyReturned
                                      ? "Returned"
                                      : partiallyReturned
                                      ? "Return More"
                                      : "Return"}
                                    <Tooltip
                                      content={
                                        fullyReturned
                                          ? "Item completely returned"
                                          : partiallyReturned
                                          ? "More items to be returned"
                                          : "Return this item"
                                      }
                                      style="light"
                                      placement="top"
                                    >
                                      <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100" />
                                    </Tooltip>
                                  </button>

                                  
                                       { (rel.qtyReturned && rel.qtyReturned > 0) && (
                                       <button
                                      onClick={() =>
                                        navigate(`/${isSuperAdmin ? "admin" : "user"}-dashboard/returns-details/${rel._id}`)
                                      }
                                      className="group relative px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs"
                                    >
                                      View History
                                      <Tooltip
                                        content="View full return history for this release"
                                        style="light"
                                        placement="top"
                                      >
                                        <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100" />
                                      </Tooltip>
                                    </button>
                                  )}
                                </>
                              )}

                              {rel.approvalStatus === "pending" && !isSuperAdmin && (
                                <span className="group relative inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  Reviewing
                                  <Tooltip
                                    content="Your release is being reviewed"
                                    style="light"
                                    placement="top"
                                  >
                                    <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100" />
                                  </Tooltip>
                                </span>
                              )}

                              {(!rel.isReturnable || rel.approvalStatus === "cancelled") && (
                                <span className="group relative inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  Not returnable
                                  <Tooltip
                                    content="This release cannot be returned"
                                    style="light"
                                    placement="top"
                                  >
                                    <span className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100" />
                                  </Tooltip>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {filteredReleases.length > recordsPerPage && (
              <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-gray-600 text-sm md:text-base">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <ReleaseApprovalPanel user={user} onUpdate={fetchReleases} />
        )}
      </motion.div>
    </div>
  );
}
