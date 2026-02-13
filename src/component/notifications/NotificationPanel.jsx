import { useEffect, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Bell, CheckCircle2, Loader2, AlertTriangle, Package } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";


const NotificationPanel = () => {
  const { notifications, loading, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStockStyle = (quantity) => {
    if (quantity === undefined) return "bg-gray-50 border-gray-200";
    if (quantity > 50) return "bg-green-50 border-green-300";
    if (quantity > 10) return "bg-yellow-50 border-yellow-300";
    return "bg-red-50 border-red-400";
  };

  return (
    <div className="relative" ref={panelRef}>
      <Toaster position="top-right" />

      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <span className="text-sm text-gray-500">
              {notifications.length} total
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin w-6 h-6 text-gray-600" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No notifications yet.
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
              {notifications.map((note) => (
                <div
                  key={note._id}
                  className={`flex justify-between items-center p-4 border-l-4 ${note.read ? "bg-gray-50 border-gray-200" : getStockStyle(note.quantity)}`}
                >
                  <div>
                    <p className="font-medium text-gray-800">{note.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {note.createdAt
                        ? new Date(note.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </div>

                  {!note.read && (
                    <button
                      onClick={() => {
                        markAsRead(note._id);
                        toast.success("Marked as read");
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
