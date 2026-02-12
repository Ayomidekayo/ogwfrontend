// src/components/ScheduleForm.jsx
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import api from "../../api/API";

export default function ScheduleForm({ onCreated }) {
  const [itemId, setItemId] = useState("");
  const [category, setCategory] = useState("repair");
  const [quantity, setQuantity] = useState(1);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(null);
  const [remarks, setRemarks] = useState("");

  // ✅ New reminder fields
  const [customReminderMinutes, setCustomReminderMinutes] = useState("");
  const [customReminderSeconds, setCustomReminderSeconds] = useState("");
  const [customReminderTime, setCustomReminderTime] = useState(""); // string like "HH:MM"

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Fetch items on mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/item/get", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && Array.isArray(res.data.items)) {
          const storedItems = res.data.items.filter(
            (item) => item.category === "stored"
          );
          setItems(storedItems);
        } else {
          toast.error("Unexpected response from server.");
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        toast.error("Failed to load items.");
      } finally {
        setLoadingItems(false);
      }
    };
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemId) {
      toast.warn("Please select an item.");
      return;
    }

    // validate reminder inputs
    if (
      (customReminderMinutes && isNaN(customReminderMinutes)) ||
      (customReminderSeconds && isNaN(customReminderSeconds))
    ) {
      toast.warn("Reminder minutes and seconds must be numbers.");
      return;
    }

    setLoading(true);
    try {
      // Prepare customReminderTime as a Date if needed, or send as string
      // We'll just send the time string + offsets
      const body = {
        item: itemId,
        category,
        quantity,
        scheduledDate,
        expectedCompletionDate,
        remarks,
        customReminderMinutes: customReminderMinutes
          ? Number(customReminderMinutes)
          : undefined,
        customReminderSeconds: customReminderSeconds
          ? Number(customReminderSeconds)
          : undefined,
        customReminderTime: customReminderTime || undefined,
      };

      const token = localStorage.getItem("token");
      const res = await api.post("/schedules", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onCreated(res.data.schedule);
      console.log(res.data.schedule)
      toast.success("Schedule created successfully!");

      // Reset form
      setItemId("");
      setCategory("repair");
      setQuantity(1);
      setScheduledDate(new Date());
      setExpectedCompletionDate(null);
      setRemarks("");
      setCustomReminderMinutes("");
      setCustomReminderSeconds("");
      setCustomReminderTime("");
    } catch (err) {
      console.error("Error creating schedule:", err);
      toast.error("Failed to create schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white rounded shadow-md space-y-4"
    >
      {/* Item dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Item
        </label>
        {loadingItems ? (
          <p>Loading items…</p>
        ) : (
          <select
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            required
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Select Item --</option>
            {items.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="repair">Repair</option>
          <option value="refill">Refill</option>
          <option value="replace">Replace</option>
          <option value="change-part">Change Part</option>
        </select>
      </div>

      {/* Quantity */}
      <div>
        <label className="block font-medium">Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="border p-2 w-full"
          min="1"
          required
        />
      </div>

      {/* Scheduled Date */}
      <div>
        <label className="block font-medium">Scheduled Date</label>
        <DatePicker
          selected={scheduledDate}
          onChange={(date) => setScheduledDate(date)}
          showTimeSelect
          dateFormat="Pp"
          className="border p-2 w-full"
        />
      </div>

      {/* Expected Completion Date */}
      <div>
        <label className="block font-medium">
          Expected Completion Date (optional)
        </label>
        <DatePicker
          selected={expectedCompletionDate}
          onChange={(date) => setExpectedCompletionDate(date)}
          showTimeSelect
          dateFormat="Pp"
          className="border p-2 w-full"
          isClearable
          placeholderText="Set a date (optional)"
        />
      </div>

      {/* Remarks */}
      <div>
        <label className="block font-medium">Remarks</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="border p-2 w-full"
        ></textarea>
      </div>

      {/* ✅ Custom Reminder Inputs */}
      <div className="space-y-2">
        <div>
          <label className="block font-medium">Custom Reminder (Minutes)</label>
          <input
            type="number"
            value={customReminderMinutes}
            onChange={(e) => setCustomReminderMinutes(e.target.value)}
            className="border p-2 w-full"
            placeholder="e.g. 5"
            min="0"
          />
        </div>
        <div>
          <label className="block font-medium">Custom Reminder (Seconds)</label>
          <input
            type="number"
            value={customReminderSeconds}
            onChange={(e) => setCustomReminderSeconds(e.target.value)}
            className="border p-2 w-full"
            placeholder="e.g. 30"
            min="0"
            max="59"
          />
        </div>
        <div>
          <label className="block font-medium">Custom Reminder Time</label>
          <input
            type="time"
            value={customReminderTime}
            onChange={(e) => setCustomReminderTime(e.target.value)}
            className="border p-2 w-full"
          />
          <p className="text-sm text-gray-500">
            (Set a specific time like "14:30" for daily reminder)
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {loading ? "Scheduling..." : "Schedule"}
      </button>
    </form>
  );
}
