// src/component/ReturnModal.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const ReturnModal = ({ isOpen, release, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    itemId: "",
    releaseId: "",
    returnedBy: "",
    returnedByEmail: "",
    quantityReturned: "",
    condition: "good",
    remarks: "",
    processedBy: ""
  });

  useEffect(() => {
    if (release) {
      setForm((prev) => ({
        ...prev,
        itemId: release.item?._id || "",
        releaseId: release._id,
        returnedBy: "",
        returnedByEmail: "",
        quantityReturned: "",
        condition: "good",
        remarks: "",
        processedBy: ""  // you may fill this with current user ID if available
      }));
    }
  }, [release]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-[10000]"
  >
        <h2 className="text‑2xl font‑bold mb‑4">Return Item</h2>
        <form onSubmit={handleSubmit} className="space‑y‑4">
          <div>
            <label className="block text‑sm font‑medium text‑gray‑700 mb‑1">Item</label>
            <input
              type="text"
              name="itemId"
              value={form.itemId}
              disabled
              className="w‑full border rounded px‑3 py‑2 bg‑gray‑100"
            />
          </div>

          <div>
            <label className="block text‑sm font‑medium text‑gray‑700 mb‑1">Returned By</label>
            <input
              type="text"
              name="returnedBy"
              value={form.returnedBy}
              onChange={handleChange}
              required
              className="w‑full border rounded px‑3 py‑2"
            />
          </div>

          <div>
            <label className="block text‑sm font‑medium text‑gray‑700 mb‑1">Returned By Email</label>
            <input
              type="email"
              name="returnedByEmail"
              value={form.returnedByEmail}
              onChange={handleChange}
              required
              className="w‑full border rounded px‑3 py‑2"
            />
          </div>

          <div>
            <label className="block text‑sm font‑medium text‑gray‑700 mb‑1">Quantity Returned</label>
            <input
              type="number"
              name="quantityReturned"
              min="1"
              value={form.quantityReturned}
              onChange={handleChange}
              required
              className="w‑full border rounded px‑3 py‑2"
            />
          </div>

          <div>
            <label className="block text‑sm font‑medium text‑gray‑700 mb‑1">Condition</label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w‑full border rounded px‑3 py‑2"
            >
              <option value="good">Good</option>
              <option value="damaged">Damaged</option>
              <option value="expired">Expired</option>
              <option value="lost">Lost</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text‑sm font‑medium text‑gray‑700 mb‑1">Remarks (optional)</label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              className="w‑full border rounded px‑3 py‑2"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify‑end gap‑2 mt‑4">
            <button
              type="button"
              onClick={onClose}
              className="px‑4 py‑2 bg‑gray‑200 text‑gray‑700 rounded hover:bg‑gray‑300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px‑4 py‑2 bg‑green‑600 text‑white rounded hover:bg‑green‑700"
            >
              Submit Return
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

ReturnModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  release: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default ReturnModal;
