import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";

const ViewAndDownloadReport = ({ month, year, filterType, filterValue }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPdf = async () => {
    setLoading(true);
    let endpoint;

    if (filterType === "monthly" && month && year) {
      endpoint = `/report/monthly/${month}-${year}`;
    } else if (filterType === "yearly" && year) {
      endpoint = `/report/yearly/${year}/download`;
    } else if (filterType === "user" && filterValue) {
      endpoint = `/report/user/${filterValue}`;
    } else if (filterType === "role" && filterValue) {
      endpoint = `/report/role/${filterValue}`;
    } else {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(endpoint, { responseType: "blob" });
      const blob = new Blob([response.data], { type: response.data.type });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error fetching PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdf();
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [month, year, filterType, filterValue]);

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-white shadow rounded-lg">
      {loading && <p className="text-gray-500">Loading …</p>}
      {!loading && !pdfUrl && (
        <p className="text-red-500">Report not available or wrong parameters.</p>
      )}
      {pdfUrl && (
        <>
          <div className="relative w-full aspect-[4/3] md:aspect-video border rounded overflow-hidden mb-4">
            <iframe
              src={pdfUrl}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              title="Report PDF"
            />
          </div>
          <a
            href={pdfUrl}
            download={
              filterType === "monthly"
                ? `report-${month}-${year}.pdf`
                : filterType === "yearly"
                ? `report-${year}.pdf`
                : `${filterType}-report-${filterValue}.pdf`
            }
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download PDF
          </a>
        </>
      )}
    </div>
  );
};

export default ViewAndDownloadReport;
