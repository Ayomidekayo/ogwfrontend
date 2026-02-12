export const downloadReportPdf = async (month) => {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/report/monthly/${month}/download`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to download report");
  }
  const blob = await response.blob();
  return blob;
};
