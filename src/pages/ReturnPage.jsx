import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Tooltip, Pagination } from "flowbite-react";
import api from "../api/API";

const ReturnPage = () => {
  const [returns, setReturns] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("date-desc");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReturns = async () => {
      if (!token) {
        setReturns([]);
        setFiltered([]);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("return", {
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

  useEffect(() => {
    let list = [...returns];

    if (search.trim()) {
      list = list.filter(
        (r) =>
          r.item?.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.returnedBy?.toLowerCase().includes(search.toLowerCase()) ||
          r.condition?.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sortOption) {
      case "date-desc":
        list.sort((a, b) => new Date(b.dateReturned) - new Date(a.dateReturned));
        break;
      case "date-asc":
        list.sort((a, b) => new Date(a.dateReturned) - new Date(b.dateReturned));
        break;
      case "quantity-desc":
        list.sort((a, b) => b.quantityReturned - a.quantityReturned);
        break;
      case "quantity-asc":
        list.sort((a, b) => a.quantityReturned - b.quantityReturned);
        break;
      case "condition":
        list.sort((a, b) => a.condition.localeCompare(b.condition));
        break;
      case "status-returned":
        list.sort((a, b) =>
          new Date(b.dateReturned) - new Date(a.dateReturned)
        );
        break;
      case "status-overdue":
        list.sort((a, b) => {
          const aOverdue = a.expectedReturnBy && new Date() > new Date(a.expectedReturnBy);
          const bOverdue = b.expectedReturnBy && new Date() > new Date(b.expectedReturnBy);
          // Show overdue items first
          return (bOverdue ? 1 : 0) - (aOverdue ? 1 : 0);
        });
        break;
      default:
        break;
    }

    setFiltered(list);
    setCurrentPage(1);
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

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedReturns = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Returned Items</h1>

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
          <option value="date-desc">Sort by Date (Newest)</option>
          <option value="date-asc">Sort by Date (Oldest)</option>
          <option value="quantity-desc">Quantity (High → Low)</option>
          <option value="quantity-asc">Quantity (Low → High)</option>
          <option value="condition">Condition (A–Z)</option>
          <option value="status-returned">Status: Returned</option>
          <option value="status-overdue">Status: Overdue</option>
        </select>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 md:hidden">
        {paginatedReturns.map((r) => {
          const expected = r.expectedReturnBy ? new Date(r.expectedReturnBy) : null;
          const isOverdue = expected ? new Date() > expected : false;
          return (
            <motion.div
              key={r._id}
              className="bg-white shadow rounded-lg p-4 cursor-pointer border hover:shadow-md"
              onClick={() => setSelectedReturn(r)}
            >
              <p><strong>Item:</strong> {r.item?.name || "N/A"}</p>
              <p><strong>Returned By:</strong> {r.returnedBy}</p>
              <p><strong>Quantity:</strong> {r.quantityReturned}</p>
              <p><strong>Condition:</strong> {r.condition}</p>
              <p><strong>Date Returned:</strong> {format(new Date(r.dateReturned), "MMM d, yyyy")}</p>

              <Tooltip
                content={
                  isOverdue
                    ? `Due date was: ${r.expectedReturnBy ? format(new Date(r.expectedReturnBy), "PPpp") : "N/A"}`
                    : `Returned on: ${format(new Date(r.dateReturned), "PPpp")}`
                }
                style="light"
                placement="top"
              >
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full font-semibold ${
                    isOverdue
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {isOverdue ? "Overdue" : "Returned"}
                </span>
              </Tooltip>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto min-w-0">
        <table className="min-w-full table-auto border rounded-lg">
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
            {paginatedReturns.map((r) => {
              const expected = r.expectedReturnBy ? new Date(r.expectedReturnBy) : null;
              const isOverdue = expected ? new Date() > expected : false;
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
                  <td className="px-4 py-2">{format(new Date(r.dateReturned), "MMM d, yyyy")}</td>
                  <td className="px-4 py-2 text-center">
                    <Tooltip
                      content={
                        isOverdue
                          ? `Due date was: ${r.expectedReturnBy ? format(new Date(r.expectedReturnBy), "PPpp") : "N/A"}`
                          : `Returned on: ${format(new Date(r.dateReturned), "PPpp")}`
                      }
                      style="light"
                      placement="top"
                    >
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-semibold ${
                          isOverdue
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {isOverdue ? "Overdue" : "Returned"}
                      </span>
                    </Tooltip>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          layout="table"  // per flowbite-react docs :contentReference[oaicite:0]{index=0}
          itemsPerPage={pageSize}
          totalItems={filtered.length}
        />
      </div>

      {/* Modal code stays the same */}
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
              <p><strong>Expected Return By:</strong> {selectedReturn.expectedReturnBy
                ? format(new Date(selectedReturn.expectedReturnBy), "PPpp")
                : "N/A"}</p>
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
