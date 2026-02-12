import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import api from "../api/API";


const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [releases, setReleases] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const getConditionBadgeClass = (condition) => {
  switch ((condition || "").toLowerCase()) {
    case "good":
      return "bg-green-100 text-green-800";
    case "damaged":
      return "bg-red-100 text-red-800";
    case "expired":
      return "bg-yellow-100 text-yellow-800";
    case "lost":
      return "bg-gray-100 text-gray-800";
    case "other":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

  useEffect(() => {
    const fetchItem = async () => {
      console.log("📌 Fetching item with ID:", id);
      try {
        const { data } = await api.get(`/api/item/${id}`);
        console.log("📌 API response:", data);

        setItem(data.item);
        setReleases(data.releases || []);
        setReturns(data.returns || []);
      } catch (error) {
        console.error("❌ API error:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Error fetching item details");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleEdit = () => {
    navigate(`/admin-dashboard/item-edit/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await api.delete(`/api/item/${id}`);
      toast.success("Item deleted successfully!");
      navigate("/admin-dashboard/items");
    } catch (error) {
      console.error("❌ Delete error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Error deleting the item");
    }
  };


  const handleBackToList = () => {
    if (user?.role === "superadmin" || user?.role === "admin") {
      navigate("/admin-dashboard/items");
    } else {
      navigate("/user-dashboard/items");
    }
  };
  if (loading) return <p>Loading item details...</p>;
  if (!item) return <p>Item not found.</p>;

  return (
    <div className="p-6 bg-white shadow rounded-md">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between mb-6">
  <h1 className="text-2xl font-bold">{item.name}</h1>
  <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
    <button
      onClick={handleBackToList}
      className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md shadow-sm hover:bg-gray-300 transition-colors"
    >
      Back to Items List
    </button>

    {user?.role === "superadmin" && (
      <>
        <button
          onClick={handleEdit}
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md shadow-sm hover:bg-blue-600 transition-colors"
        >
          Edit
        </button>

        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white font-medium rounded-md shadow-sm hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </>
    )}
  </div>
</div>

      {/* ITEM DETAILS */}
      <div className="mb-6">
        <p><strong>Category:</strong> {item.category}</p>
        <p><strong>Quantity:</strong> {item.quantity} {item.measuringUnit}</p>
        <p><strong>Status:</strong> {item.currentStatus}</p>
        <p><strong>Refundable:</strong> {item.isRefundable ? "Yes" : "No"}</p>
        {item.description && <p><strong>Description:</strong> {item.description}</p>}

        <p>
          <strong>Added By:</strong>{" "}
          {item.addedBy ? item.addedBy.name : "Unknown"}
        </p>
      </div>

      {/* RELEASE HISTORY */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Release History</h2>

        {releases.length === 0 ? (
          <p>No release records found.</p>
        ) : (
          <table className="min-w-full bg-gray-100 rounded-md">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Released To</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Released By</th>
                <th className="px-4 py-2">Date Released</th>
                <th className="px-4 py-2">Return Status</th>
              </tr>
            </thead>

            <tbody>
              {releases.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="px-4 py-2">{r.releasedTo}</td>
                  <td className="px-4 py-2">{r.qtyReleased} {item.measuringUnit}</td>
                  <td className="px-4 py-2">{r.releasedBy?.name || "Unknown"}</td>
                  <td className="px-4 py-2">{new Date(r.dateReleased).toLocaleString()}</td>
                  <td className="px-4 py-2 capitalize">{r.returnStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* RETURN HISTORY */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Return History</h2>

        {returns.length === 0 ? (
          <p>No return records found.</p>
        ) : (
          <table className="min-w-full bg-gray-100 rounded-md">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Returned By</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Condition</th>
                <th className="px-4 py-2">Date Returned</th>
                <th className="px-4 py-2">Remarks</th>
              </tr>
            </thead>

           <tbody>
            {returns.map((r, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-2">
                  {r.returnedBy?.name || r.returnedByEmail || "Unknown"}
                </td>
                <td className="px-4 py-2">{r.quantityReturned}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getConditionBadgeClass(r.condition)}`}>
                    {r.condition}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {new Date(r.dateReturned).toLocaleString()}
                </td>
                <td className="px-4 py-2">{r.remarks}</td>
              </tr>
            ))}
          </tbody>

          </table>
        )}
      </div>
    </div>
  );
};

export default ItemDetailPage;