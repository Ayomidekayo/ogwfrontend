import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Tooltip } from "flowbite-react";
import api from "../api/API";

function usePagination({ totalCount, pageSize, currentPage }) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const pages = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= totalPages; i++) arr.push(i);
    return arr;
  }, [totalPages]);
  return { totalPages, pages };
}
const SkeletonLoader = ({ height = "h-6", width = "w-full", rounded = "rounded-md" }) => (
  <div className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 ${height} ${width} ${rounded}`}>
  
    <div className="h-4 w-full rounded bg-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
            </div>
  </div>
  
);


const ItemsPage = () => {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        toast.error("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const [profileRes, itemsRes] = await Promise.all([
          api.get("/api/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/api/item/get", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUserRole(profileRes.data.role);
        const itemsArray = Array.isArray(itemsRes.data.items) ? itemsRes.data.items : [];
        setAllItems(itemsArray);
        setFilteredItems(itemsArray);
      } catch (err) {
        console.error("Data fetch error:", err);
        toast.error("Failed to load items.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    const filtered = allItems.filter((item) => {
      return (
        item.name.toLowerCase().includes(lower) ||
        (item.category && item.category.toLowerCase().includes(lower))
      );
    });
    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [searchQuery, allItems]);

  const { totalPages, pages } = usePagination({
    totalCount: filteredItems.length,
    pageSize,
    currentPage,
  });

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [currentPage, pageSize, filteredItems]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/item/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllItems((prev) => prev.filter((item) => item._id !== id));
      toast.success("Item deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete item");
    }
  };

  const handleDetails = (id) => {
    const role = user?.role || userRole;
    navigate(
      role === "superadmin" || role === "admin"
        ? `/admin-dashboard/item/details/${id}`
        : `/user-dashboard/item/details/${id}`
    );
  };

  const handleRelease = (item) => {
    const role = user?.role || userRole;
    navigate(
      role === "superadmin" || role === "admin"
        ? `/admin-dashboard/releases/${item._id}`
        : `/user-dashboard/releases/${item._id}`
    );
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "deleted":
        return "text-gray-400 font-semibold";
      case "in":
        return "text-green-600 font-semibold";
      case "out":
        return "text-yellow-500 font-semibold";
      default:
        return "text-gray-500 font-semibold";
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <SkeletonLoader/>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header + Search + Add */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">Items Inventory</h1>
        <div className="flex gap-2 items-center w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by name or category"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-full md:w-auto"
          />
          <Link
            to={
              user?.role === "superadmin" || user?.role === "admin"
                ? "/admin-dashboard/add-item"
                : "/user-dashboard/add-item"
            }
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            + Add Item
          </Link>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="space-y-4 md:hidden">
        {paginatedItems.map((item) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-lg">{item.name}</p>
                <p className="text-gray-500 text-sm">{item.category}</p>
              </div>
              <span className={getStatusColor(item.currentStatus)}>
                {item.currentStatus || "—"}
              </span>
            </div>

            <div>
              <p>
                <strong>Quantity:</strong>{" "}
                {item.combinedQuantity
                  ? item.combinedQuantity
                  : `${item.quantity} ${item.measuringUnit}`}
              </p>
              <p>
                <strong>Refundable:</strong> {item.isRefundable ? "Yes" : "No"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Release Button with Disabled & Tooltip */}
              <div className="relative group">
                <button
                  onClick={() => handleRelease(item)}
                  disabled={item.currentStatus === "out"}
                  className={`px-3 py-1 rounded transition ${
                    item.currentStatus === "out"
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                  aria-disabled={item.currentStatus === "out"}
                >
                  Release
                </button>
                {item.currentStatus === "out" && (
                  <div className="absolute bottom-full mb-1 w-max bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Cannot release — item is out
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDetails(item._id)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
              >
                View
              </button>

              {userRole === "superadmin" && (
                <>
                  <Link
                    to={`/items/edit/${item._id}`}
                    className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white border shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Quantity</th>
              <th className="px-4 py-2 border">Refundable</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item) => (
                <motion.tr
                  key={item._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  <td className="px-4 py-2 border">{item.name}</td>
                  <td className="px-4 py-2 border">{item.category}</td>
                  <td className="px-4 py-2 border">
                    {item.combinedQuantity ||
                      `${item.quantity} ${item.measuringUnit}`}
                  </td>
                  <td className="px-4 py-2 border">
                    {item.isRefundable ? "Yes" : "No"}
                  </td>
                  <td className={`px-4 py-2 border ${getStatusColor(item.currentStatus)}`}>
                    {item.currentStatus || "—"}
                  </td>
                  <td className="px-4 py-2 border flex flex-wrap justify-center gap-2">
                    <div className="relative group">
                      <button
                        onClick={() => handleRelease(item)}
                        disabled={item.currentStatus === "out"}
                        className={`px-3 py-1 rounded transition ${
                          item.currentStatus === "out"
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                        aria-disabled={item.currentStatus === "out"}
                      >
                        Release
                      </button>
                      {item.currentStatus === "out" && (
                        <div className="absolute bottom-full mb-1 w-max bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          Cannot release — item is out
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDetails(item._id)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                    >
                      View
                    </button>

                    {userRole === "superadmin" && (
                      <>
                        <Link
                          to={`/items/edit/${item._id}`}
                          className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No items match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setCurrentPage(p)}
            className={`px-3 py-1 rounded ${
              p === currentPage ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ItemsPage;
