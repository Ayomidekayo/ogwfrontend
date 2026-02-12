import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Download, CalendarDays, Shield, User, Loader2, FileText } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/API";

const API_BASE = api;
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

const monthNames = Array.from({ length: 12 }, (_, i) =>
  new Date(0, i).toLocaleString("default", { month: "long" })
);

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

const Card = ({ children, className = "" }) => (
  <motion.div
    {...fadeIn}
    transition={{ duration: 0.25 }}
    className={`bg-white rounded-xl shadow-md p-4 ${className}`}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ icon: Icon, title, right }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <Icon className="text-blue-600" />
      <h3 className="text-lg font-bold">{title}</h3>
    </div>
    {right}
  </div>
);

function formatCell(val) {
  if (val === null || val === undefined) return "—";
  if (typeof val === "string" && /\d{4}-\d{2}-\d{2}/.test(val)) {
    return new Date(val).toLocaleDateString();
  }
  return val;
}

function PaginatedSelectableTable({ data, columns, loading, rowsPerPage = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginated = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleRow = (idx) => {
    if (selectedRows.includes(idx)) {
      setSelectedRows(selectedRows.filter((i) => i !== idx));
    } else {
      setSelectedRows([...selectedRows, idx]);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        {[...Array(rowsPerPage)].map((_, i) => (
          <Skeleton key={i} height={40} className="mb-2" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="p-4 text-center text-gray-500">No data available.</div>;
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-[600px] w-full table-auto text-left text-sm text-gray-500 border border-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="w-12 px-4 py-2">
              <input
                type="checkbox"
                checked={selectedRows.length === paginated.length}
                onChange={() => {
                  if (selectedRows.length === paginated.length) setSelectedRows([]);
                  else setSelectedRows(paginated.map((_, idx) => idx));
                }}
              />
            </th>
            {columns.map((col) => (
              <th key={col} className="whitespace-nowrap px-4 py-2">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {paginated.map((row, idx) => (
            <tr
              key={idx}
              className={`cursor-pointer ${selectedRows.includes(idx) ? "bg-blue-50" : "hover:bg-gray-100"}`}
              onClick={() => toggleRow(idx)}
            >
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(idx)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleRow(idx);
                  }}
                />
              </td>
              {columns.map((col) => (
                <td key={col} className="whitespace-nowrap px-4 py-2">{formatCell(row[col])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1">{currentPage} / {totalPages}</span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function Report() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [roleName, setRoleName] = useState("");
  const [userName, setUserName] = useState("");

  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [summary, setSummary] = useState(null);
  const [rawData, setRawData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingSummary(true);
      try {
        const res = await axios.get(`${API_BASE}/report/inventory-summary`, { headers: authHeaders() });
        setSummary(res.data.summary);
        setRawData(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load inventory data");
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchData();
  }, []);

  const filteredReleases = useMemo(() => {
    if (!rawData?.releases) return [];
    return rawData.releases.filter((r) =>
      (r.releasedBy?.name || "").toLowerCase().includes(userName.toLowerCase())
    );
  }, [rawData, userName]);

  const filteredReturns = useMemo(() => {
    if (!rawData?.returns) return [];
    return rawData.returns.filter((r) =>
      (r.processedBy?.name || "").toLowerCase().includes(userName.toLowerCase())
    );
  }, [rawData, userName]);

  const handleDownloadPDF = async (url, fileName, setLoading) => {
    setLoading(true);
    try {
      const res = await axios.get(url, { headers: authHeaders(), responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      toast.success(`${fileName} downloaded`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to download ${fileName}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer position="top-right" autoClose={2000} />

      <motion.div {...fadeIn} transition={{ duration: 0.25 }} className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-blue-600" /> Inventory Reports
        </h2>
        <p className="text-gray-600 mt-1">Download monthly and role-based PDFs, filter by user, and view inventory data.</p>
      </motion.div>

      {/* Filters */}
      <Card className="mb-6">
        <SectionHeader icon={CalendarDays} title="Filters" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="font-semibold mb-1 block">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full"
            >
              <option value="">-- Choose Month --</option>
              {monthNames.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold mb-1 block">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2025"
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
          </div>

          <div>
            <label className="font-semibold mb-1 block">Role</label>
            <select
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full"
            >
              <option value="">-- Choose Role --</option>
              <option value="superadmin">Manager</option>
              <option value="admin">Assistant Manager</option>
              <option value="user">Staff</option>
            </select>
          </div>

          <div>
            <label className="font-semibold mb-1 block">User Name</label>
            <div className="flex items-center border border-gray-300 rounded-lg p-2">
              <User className="text-gray-500 mr-2" />
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Filter by user name"
                className="w-full outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={(e) => handleDownloadPDF(`${API_BASE}/report/monthly?month=${month}&year=${year}`, `Inventory_Report_${month}_${year}.pdf`, setLoadingMonthly)}
            disabled={loadingMonthly}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loadingMonthly ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {loadingMonthly ? "Generating..." : "Download Monthly PDF"}
          </button>

          <button
            onClick={(e) => handleDownloadPDF(`${API_BASE}/report/role/${encodeURIComponent(roleName)}`, `Role_Report_${roleName}.pdf`, setLoadingRole)}
            disabled={loadingRole}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loadingRole ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
            {loadingRole ? "Generating..." : "Download Role PDF"}
          </button>
        </div>
      </Card>

      {/* Releases Table */}
      <Card className="mb-6">
        <SectionHeader icon={Download} title="Releases — Filtered by User" />
        <PaginatedSelectableTable
          loading={loadingSummary}
          data={filteredReleases.map((r) => ({
            "Item Name": r.item?.name ?? "—",
            "Qty Released": r.qtyReleased ?? "—",
            "Released To": r.releasedTo ?? "—",
            "Released By": r.releasedBy?.name ?? "—",
            "Date Released": r.dateReleased ?? "—",
          }))}
          columns={["Item Name", "Qty Released", "Released To", "Released By", "Date Released"]}
          rowsPerPage={10}
        />
      </Card>

      {/* Returns Table */}
      <Card className="mb-6">
        <SectionHeader icon={Download} title="Returns — Filtered by User" />
        <PaginatedSelectableTable
          loading={loadingSummary}
          data={filteredReturns.map((r) => ({
            "Item Name": r.item?.name ?? "—",
            "Qty Returned": r.quantityReturned ?? "—",
            "Returned By": r.returnedBy ?? "—",
            "Processed By": r.processedBy?.name ?? "—",
            "Date Returned": r.dateReturned ?? "—",
          }))}
          columns={["Item Name", "Qty Returned", "Returned By", "Processed By", "Date Returned"]}
          rowsPerPage={10}
        />
      </Card>
    </div>
  );
}
