import React, { useState } from 'react';
import ReturnModal from './ReturnModal';
import api from '../api/API';

const ReleasesTable = ({ releases, onReturnCompleted }) => {
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenReturn = (release) => {
    setSelectedRelease(release);
    setIsModalOpen(true);
  };

  const handleCloseReturn = () => {
    setIsModalOpen(false);
    setSelectedRelease(null);
  };

  const handleReturnSubmit = async () => {
    // Call your API to submit return details
    try {
      // e.g., axios.post(..., { ...formData })
      await api.post(`/api/release/${selectedRelease._id}/return`, {
        // Include any required return details in the payload
        returnedQty: selectedRelease.qtyReleased, // Example: assuming full return
      });
      onReturnCompleted(); // refresh list
      handleCloseReturn();
    } catch (error) {
      console.error('Return submission failed', error);
      // show error toast
    }
  };

  return (
    <>
      <table className="w‑full mt‑6 bg‑white shadow rounded‑lg overflow‑hidden">
        <thead className="bg‑gray‑100 text‑gray‑700">
          {/* table headers */}
        </thead>
        <tbody>
          {releases.map((rel) => (
            <tr key={rel._id} className="border‑b hover:bg‑gray‑50">
              {/* other cells */}
              <td className="p‑3">
                {rel.isReturnable && rel.approvalStatus === 'approved' && rel.returnStatus !== 'fully returned' ? (
                  <button
                    onClick={() => handleOpenReturn(rel)}
                    className="px‑3 py‑1 bg‑blue‑600 text‑white rounded hover:bg‑blue‑700"
                  >
                    Return
                  </button>
                ) : (
                  <span className="text‑gray‑400">‑</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ReturnModal
        isOpen={isModalOpen}
        release={selectedRelease}
        onClose={handleCloseReturn}
        onSubmit={handleReturnSubmit}
      />
    </>
  );
};

export default ReleasesTable;
