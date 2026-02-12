import React, { useState, useEffect } from "react";
import { RPConfig, RPProvider, RPDefaultLayout, RPPages } from "@pdf-viewer/react";

function PdfViewerWithBlob({ month }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let blobUrl = null;

    const loadPdf = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/report/monthly/${month}/download`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch PDF");
        }
        const blob = await response.blob();
        blobUrl = URL.createObjectURL(blob);
        setPdfUrl(blobUrl);
      } catch (err) {
        console.error("Error loading PDF:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();

    // Cleanup — revoke object URL when component unmounts
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [month]);

  if (loading) {
    return <p className="text-gray-500">Loading PDF report…</p>;
  }

  if (!pdfUrl) {
    return <p className="text-red-500">Could not load PDF report.</p>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-white rounded-lg shadow">
      <RPConfig>
        <RPProvider src={pdfUrl}>
          <RPDefaultLayout style={{ height: "600px" }}>
            <RPPages />
          </RPDefaultLayout>
        </RPProvider>
      </RPConfig>

      <div className="mt-4">
        <a
          href={pdfUrl}
          download={`report-${month}.pdf`}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}

export default PdfViewerWithBlob;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, Pagination, Tooltip } from "flowbite-react";

const Report = () => {
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
      case "status-overdue":
        list.sort((a, b) => {
          const aOverdue = a.expectedReturnBy && new Date() > new Date(a.expectedReturnBy);
          const bOverdue = b.expectedReturnBy && new Date() > new Date(b.expectedReturnBy);
          return (bOverdue ? 1 : 0) - (aOverdue ? 1 : 0);
        });
        break;
      default:
        break;
    }
    setFiltered(list);
    setCurrentPage(1);
  }, [search, sortOption, returns]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedReturns = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Number of placeholder rows when loading
  const skeletonRows = Array.from({ length: 5 });

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
          <option value="condition">Condition (A-Z)</option>
          <option value="status-overdue">Status: Overdue</option>
        </select>
      </div>

      <div className="overflow-x-auto">

<Table className="min-w-full">
  <TableHead className="bg-gray-100">
    <TableRow>
      <TableHeadCell>Item</TableHeadCell>
      <TableHeadCell>Returned By</TableHeadCell>
      <TableHeadCell>Quantity</TableHeadCell>
      <TableHeadCell>Condition</TableHeadCell>
      <TableHeadCell>Date Returned</TableHeadCell>
      <TableHeadCell>Status</TableHeadCell>
    </TableRow>
  </TableHead>
  <TableBody className="divide-y">
    {loading
      ? skeletonRows.map((_, idx) => (
          <TableRow key={idx} className="bg-white">
            <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-24" /></TableCell>
            <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-20" /></TableCell>
            <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-12" /></TableCell>
            <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-16" /></TableCell>
            <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-28" /></TableCell>
            <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-16" /></TableCell>
          </TableRow>
        ))
      : paginatedReturns.map((r) => {
          const expected = r.expectedReturnBy ? new Date(r.expectedReturnBy) : null;
          const isOverdue = expected ? new Date() > expected : false;
          return (
            <TableRow key={r._id} className={`cursor-pointer hover:bg-gray-50 ${isOverdue ? "bg-red-50" : ""}`} onClick={() => setSelectedReturn(r)}>
              <TableCell>{r.item?.name || "N/A"}</TableCell>
              <TableCell>{r.returnedBy}</TableCell>
              <TableCell>{r.quantityReturned}</TableCell>
              <TableCell className="capitalize">{r.condition}</TableCell>
              <TableCell>{format(new Date(r.dateReturned), "MMM d, yyyy")}</TableCell>
              <TableCell className="text-center">
                <Tooltip
                  content={
                    isOverdue
                      ? `Due date was: ${r.expectedReturnBy ? format(new Date(r.expectedReturnBy), "PPpp") : "N/A"}`
                      : `Returned on: ${format(new Date(r.dateReturned), "PPpp")}`
                  }
                  style="light"
                  placement="top"
                >
                  <span className={`inline-block px-3 py-1 rounded-full font-semibold ${
                    isOverdue ? "bg-red-100 text-red-700" : "bg-green-100 text-green-800"
                  }`}>
                    {isOverdue ? "Overdue" : "Returned"}
                  </span>
                </Tooltip>
              </TableCell>
            </TableRow>
          );
        })}
  </TableBody>
</Table>

      </div>

      {!loading && (
        <div className="flex justify-center mt-6">
          <Pagination
          currentPage={currentPage}
          onPageChange={handlePageChange}
          layout="table"
          itemsPerPage={pageSize}
          totalItems={filtered.length}
        />

        </div>
      )}

      {selectedReturn && (
        // ... your modal code for selectedReturn ...
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

export default Report;

