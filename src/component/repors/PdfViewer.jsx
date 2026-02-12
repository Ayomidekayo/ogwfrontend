import React from "react";

const PdfViewer = ({ pdfBlobUrl }) => {
  return (
    <iframe
      src={pdfBlobUrl}
      width="100%"
      height="600px"
      title="PDF Report"
      style={{ border: "none" }}
    />
  );
};

export default PdfViewer;
