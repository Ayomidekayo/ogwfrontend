import React, { useState } from "react";
import ReportFilter from "../component/repors/ReportFilter";
import DashboardChart from "../component/repors/DashboardChart";
import ViewAndDownloadReport from "../component/repors/ViewAndDownloadReport";



function ReportsPage() {
  const [currentFilter, setCurrentFilter] = useState({ filterType: "monthly", month: "", year: "", filterValue: "" });

  const handleFilterApply = (filterObj) => {
    setCurrentFilter(filterObj);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Reports Dashboard</h1>

      <ReportFilter onFilter={handleFilterApply} />

      <div className="mt-8">
        <DashboardChart />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Report Viewer</h2>
        <ViewAndDownloadReport
          month={currentFilter.month}
          year={currentFilter.year}
          filterType={currentFilter.filterType}
          filterValue={currentFilter.filterValue}
        />
      </div>
    </div>
  );
}

export default ReportsPage;
