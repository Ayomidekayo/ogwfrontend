import React, { useState } from "react";
import { toast } from "react-toastify";
import { Download, CalendarDays, Users } from "lucide-react";


const ReportFilter = ({ onFilter }) => {
  const [filterType, setFilterType] = useState("monthly");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();

    // Validation
    if (filterType === "monthly" && (!month || !year)) {
      toast.warning("Please select both month and year");
      return;
    }
    if ((filterType === "user" || filterType === "role") && !filterValue) {
      toast.warning(`Please enter ${filterType}`);
      return;
    }

    setLoading(true);
    try {
      let endpoint = "";
      switch (filterType) {
        case "monthly":
          // Format: MM-YYYY
          endpoint = `/report/monthly/${month}-${year}/download`;
          break;
        case "yearly":
          endpoint = `/report/yearly/${year}/download`;
          break;
        case "user":
          endpoint = `/report/user/${filterValue}`;
          break;
        case "role":
          endpoint = `/report/role/${filterValue}`;
          break;
        default:
          throw new Error("Invalid filter type");
      }

      await onFilter({ filterType, month, year, filterValue, endpoint });
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CalendarDays className="text-blue-600" /> Generate Report
      </h2>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="flex items-center space-x-4">
          <label className="font-medium">Filter By:</label>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setMonth("");
              setYear("");
              setFilterValue("");
            }}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="monthly">Month</option>
            <option value="yearly">Year</option>
            <option value="user">User ID</option>
            <option value="role">Role</option>
          </select>
        </div>

        {filterType === "monthly" && (
          <div className="md:flex md:space-x-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full border-gray-300 border rounded-lg px-3 py-2"
              >
                <option value="">-- Select Month --</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 mt-4 md:mt-0">
              <label className="block mb-1 font-medium">Year</label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border-gray-300 border rounded-lg px-3 py-2"
                placeholder="2025"
              />
            </div>
          </div>
        )}

        {filterType === "yearly" && (
          <div>
            <label className="block mb-1 font-medium">Year</label>
            <input
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border-gray-300 border rounded-lg px-3 py-2"
              placeholder="2025"
            />
          </div>
        )}

        {(filterType === "user" || filterType === "role") && (
          <div>
            <label className="block mb-1 font-medium">
              {filterType === "user" ? "User ID or Name" : "Role Name"}
            </label>
            <input
              type="text"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full border-gray-300 border rounded-lg px-3 py-2"
              placeholder={
                filterType === "user"
                  ? "Enter User ID or Name"
                  : "Enter Role (e.g. admin)"
              }
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-70"
        >
          <Download className="w-5 h-5" />
          {loading ? "Generating..." : "Generate PDF"}
        </button>
      </form>
    </div>
  );
};

export default ReportFilter;
