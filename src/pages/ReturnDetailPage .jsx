import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../api/API";

// const ReturnDetailPage = () => {
//   const { releaseId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const token = localStorage.getItem("token");

//   const conditionRemarksMap = {
//     good: "Item returned in good condition.",
//     damaged: "Item returned with damage.",
//     expired: "Item returned after expiry.",
//     lost: "Item reported lost on return.",
//     other: "Other return condition specified.",
//   };

//   const [release, setRelease] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   const [formData, setFormData] = useState({
//     returnedBy: "",
//     returnedByEmail: "",
//     quantityReturned: "",
//     expectedReturnBy: "",
//     condition: "",
//     remarks: "", // this will be set automatically
//   });

//   useEffect(() => {
//     if (!token) {
//       toast.error("Session expired. Please log in again.");
//       navigate("/login");
//       return;
//     }

//     const fetchRelease = async () => {
//       try {
//         const res = await api.get(
//           `/release/${releaseId}`,
//           { headers: { Authorization: `Bearer ${token.trim()}` } }
//         );
//         setRelease(res.data);
//       } catch (err) {
//         console.error("Error loading release:", err);
//         toast.error("Failed to load release details.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRelease();
//   }, [releaseId, token, navigate]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => {
//       const next = { ...prev, [name]: value };

//       // If condition changes, auto‑set remark
//       if (name === "condition") {
//         next.remarks = conditionRemarksMap[value] || "";
//       }

//       return next;
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!release) {
//       toast.error("Release data not ready.");
//       return;
//     }

//     const qty = Number(formData.quantityReturned);
//     if (isNaN(qty) || qty < 1) {
//       toast.error("Please enter a valid quantity to return.");
//       return;
//     }

//     if (qty > release.qtyReleased) {
//       toast.error(
//         `You can't return more than was released (${release.qtyReleased}).`
//       );
//       return;
//     }

//     if (!formData.condition) {
//       toast.error("Please select the condition of the item being returned.");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const payload = {
//         ...formData,
//         releaseId: release._id,
//         itemId: release.item._id,
//       };

//       const resp = await api.post(
//         `/return/release/${release._id}`,
//         payload,
//         { headers: { Authorization: `Bearer ${token.trim()}` } }
//       );

//       toast.success(resp.data.message || "Return submitted successfully!");

//       // Redirect after success
//       if (user?.role === "superadmin" || user?.role === "admin") {
//         navigate("/admin-dashboard/releases");
//       } else {
//         navigate("/user-dashboard/releases");
//       }
//     } catch (err) {
//       console.error("Error submitting return:", err.response || err);
//       toast.error(err.response?.data?.message || "Failed to submit return.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-6 text-center text-gray-600">
//         <h2 className="text-xl font-semibold mb-4">Loading release …</h2>
//         <div className="animate-pulse space-y-4">
//           <div className="h-6 bg-gray-300 rounded w-1/3 mx-auto"></div>
//           <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
//         </div>
//       </div>
//     );
//   }

//   if (!release) {
//     return (
//       <div className="p-6 text-center text-red-600">
//         <h2 className="text-xl font-semibold">Release not found.</h2>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 flex flex-col gap-8 max-w-4xl mx-auto">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="bg-white shadow rounded-lg p-6 border"
//       >
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-bold">Return for Released Item</h2>
//           <button
//             onClick={() => navigate(-1)}
//             className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
//           >
//             Back
//           </button>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
//           <div>
//             <p>
//               <span className="font-semibold">Item:</span> {release.item?.name}
//             </p>
//             <p>
//               <span className="font-semibold">Quantity Released:</span>{" "}
//               {release.qtyReleased} {release.item?.measuringUnit}
//             </p>
//             <p>
//               <span className="font-semibold">Released To:</span>{" "}
//               {release.releasedTo}
//             </p>
//           </div>
//           <div>
//             <p>
//               <span className="font-semibold">Approval Status:</span>{" "}
//               {release.approvalStatus}
//             </p>
//             <p>
//               <span className="font-semibold">Return Status:</span>{" "}
//               {release.returnStatus}
//             </p>
//             {release.qtyRemaining &&(<p>
//               <span className="font-semibold">Remaining item to return:</span>{" "}
//               {release.qtyRemaining} {release.item?.measuringUnit}
//             </p>)}
//           </div>
//         </div>
//       </motion.div>

//       {release.isReturnable && release.approvalStatus === "approved" ? (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white shadow rounded-lg p-6 border"
//         >
//           <h3 className="text-xl font-bold mb-4">Submit Return</h3>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Returned By */}
//             <div>
//               <label className="block text-gray-700 font-medium mb-1">
//                 Returned By:
//               </label>
//               <input
//                 type="text"
//                 name="returnedBy"
//                 value={formData.returnedBy}
//                 onChange={handleChange}
//                 className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//                 disabled={submitting}
//               />
//             </div>

//             {/* Returned By Email */}
//             <div>
//               <label className="block text-gray-700 font-medium mb-1">
//                 Returned By Email:
//               </label>
//               <input
//                 type="email"
//                 name="returnedByEmail"
//                 value={formData.returnedByEmail}
//                 onChange={handleChange}
//                 className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 disabled={submitting}
//               />
//             </div>

//             {/* Quantity Returned */}
//             <div>
//               <label className="block text-gray-700 font-medium mb-1">
//                 Quantity Returned:
//               </label>
//               <input
//                 type="number"
//                 name="quantityReturned"
//                 min="1"
//                 max={release.qtyReleased}
//                 value={formData.quantityReturned}
//                 onChange={handleChange}
//                 className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//                 disabled={submitting}
//               />
//               <span className="text-gray-700">
//                 {" "}
//                 {release.item?.measuringUnit}
//               </span>
//             </div>

//             {/* Condition */}
//             <div>
//               <label className="block text-gray-700 font-medium mb-1">
//                 Condition:
//               </label>
//               <select
//                 name="condition"
//                 value={formData.condition}
//                 onChange={handleChange}
//                 className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//                 disabled={submitting}
//               >
//                 <option value="" disabled>
//                   Select condition
//                 </option>
//                 <option value="good">Good</option>
//                 <option value="damaged">Damaged</option>
//                 <option value="expired">Expired</option>
//                 <option value="lost">Lost</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>

//             {/* Remarks (read-only) */}
//             <div>
//               <label className="block text-gray-700 font-medium mb-1">
//                 Remarks:
//               </label>
//               <textarea
//                 name="remarks"
//                 value={formData.remarks}
//                 readOnly
//                 rows={2}
//                 className="w-full border rounded px-3 py-2 bg-gray-100"
//               />
//             </div>

//             <div className="flex justify-end">
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
//               >
//                 {submitting ? "Submitting..." : "Submit Return"}
//               </button>
//             </div>
//           </form>
//         </motion.div>
//       ) : (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white shadow rounded-lg p-6 border text-center"
//         >
//           <p className="text-gray-500">
//             This release cannot be returned because it is not returnable or not
//             yet approved.
//           </p>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default ReturnDetailPage;


const ReturnDetailPage = () => {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const conditionRemarksMap = {
    good: "Item returned in good condition.",
    damaged: "Item returned with damage.",
    expired: "Item returned after expiry.",
    lost: "Item reported lost on return.",
    other: "Other return condition specified.",
  };

  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    returnedBy: "",
    returnedByEmail: "",
    quantityReturned: "",
    condition: "",
    remarks: "",
  });

  // Fetch release details
  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const res = await api.get(`/release/${releaseId}`);
        setRelease(res.data);
      } catch (err) {
        console.error("Error loading release:", err);
        toast.error("Failed to load release details.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (releaseId) {
      fetchRelease();
    }
  }, [releaseId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "condition") {
        updated.remarks = conditionRemarksMap[value] || "";
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!release) {
      toast.error("Release data not ready.");
      return;
    }

    const qty = Number(formData.quantityReturned);

    if (isNaN(qty) || qty < 1) {
      toast.error("Enter a valid return quantity.");
      return;
    }

    if (qty > release.qtyReleased) {
      toast.error(
        `Cannot return more than released (${release.qtyReleased}).`
      );
      return;
    }

    if (!formData.condition) {
      toast.error("Please select return condition.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        releaseId: release._id,
        itemId: release.item?._id,
      };

      const response = await api.post(
        `/return/release/${release._id}`,
        payload
      );

      toast.success(response.data.message || "Return submitted successfully!");

      if (user?.role === "superadmin" || user?.role === "admin") {
        navigate("/admin-dashboard/releases");
      } else {
        navigate("/user-dashboard/releases");
      }
    } catch (err) {
      console.error("Submit error:", err.response || err);
      toast.error(
        err.response?.data?.message || "Failed to submit return."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        <h2 className="text-xl font-semibold mb-4">
          Loading release...
        </h2>
      </div>
    );
  }

  // Not Found State
  if (!release) {
    return (
      <div className="p-6 text-center text-red-600">
        <h2 className="text-xl font-semibold">
          Release not found.
        </h2>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-8">
      {/* Release Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow rounded-lg p-6 border"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Return for Released Item
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Back
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-gray-800">
          <div>
            <p>
              <strong>Item:</strong> {release.item?.name}
            </p>
            <p>
              <strong>Quantity Released:</strong>{" "}
              {release.qtyReleased}{" "}
              {release.item?.measuringUnit}
            </p>
            <p>
              <strong>Released To:</strong>{" "}
              {release.releasedTo}
            </p>
          </div>

          <div>
            <p>
              <strong>Approval Status:</strong>{" "}
              {release.approvalStatus}
            </p>
            <p>
              <strong>Return Status:</strong>{" "}
              {release.returnStatus}
            </p>
            {release.qtyRemaining ? (
              <p>
                <strong>Remaining to Return:</strong>{" "}
                {release.qtyRemaining}{" "}
                {release.item?.measuringUnit}
              </p>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* Return Form */}
      {release.isReturnable &&
      release.approvalStatus === "approved" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow rounded-lg p-6 border"
        >
          <h3 className="text-xl font-bold mb-4">
            Submit Return
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="returnedBy"
              placeholder="Returned By"
              value={formData.returnedBy}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              disabled={submitting}
            />

            <input
              type="email"
              name="returnedByEmail"
              placeholder="Returned By Email"
              value={formData.returnedByEmail}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              disabled={submitting}
            />

            <input
              type="number"
              name="quantityReturned"
              placeholder="Quantity Returned"
              min="1"
              max={release.qtyReleased}
              value={formData.quantityReturned}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              disabled={submitting}
            />

            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              disabled={submitting}
            >
              <option value="">Select condition</option>
              <option value="good">Good</option>
              <option value="damaged">Damaged</option>
              <option value="expired">Expired</option>
              <option value="lost">Lost</option>
              <option value="other">Other</option>
            </select>

            <textarea
              name="remarks"
              value={formData.remarks}
              readOnly
              rows={2}
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Return"}
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow rounded-lg p-6 border text-center"
        >
          <p className="text-gray-500">
            This release cannot be returned because it is not returnable or not approved.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ReturnDetailPage;
