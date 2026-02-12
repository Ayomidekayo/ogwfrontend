// AdminDashboard.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { toast, Toaster } from "react-hot-toast";
import ReactApexChart from "react-apexcharts";
import CountUp from "react-countup";
import DateChart from "./DateChart";
import api from "../api/API";

// Skeleton loader
const SkeletonLoader = ({ height = "h-6", width = "w-full", rounded = "rounded-md" }) => (
  <div className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 ${height} ${width} ${rounded}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
  </div>
);

// KPI Card
const DashboardCard = ({ title, value, hint, color, loading }) => (
  <div className="rounded-xl shadow p-5 text-white transition-all hover:scale-[1.03] duration-200" style={{ backgroundColor: color }}>
    {loading ? (
      <>
        <SkeletonLoader height="h-4" width="w-20" />
        <SkeletonLoader height="h-8" width="w-24" className="mt-3" />
        <SkeletonLoader height="h-3" width="w-16" className="mt-2" />
      </>
    ) : (
      <>
        <div className="text-sm opacity-80">{title}</div>
        <div className="text-3xl font-bold mt-2">
          <CountUp end={value || 0} duration={1.5} separator="," />
        </div>
        {hint && <div className="text-xs opacity-80 mt-1">{hint}</div>}
      </>
    )}
  </div>
);

// Friendly role mapping
const getFriendlyRole = (role) => {
  const r = (role || "").toString().toLowerCase();
  if (r === "superadmin") return "Manager";
  if (r === "admin") return "Assistant Manager";
  return "Staff";
};

const API = api;

export default function AdminDashboard() {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({
    counts: { totalItems: 0, totalUsers: 0, totalDeletedItems: 0 },
    lowStock: [],
    topReleased: [],
    threshold: 0,
    expectedOverdueTrend: [],
    chartData: { released: 0, returned: 0 },
  });
  const [loading, setLoading] = useState(true);
  const lastLowStockIdsRef = useRef(new Set());

  // auth header helper (trim + guard)
  const authHeader = () => {
    const t = (token || "").toString().trim();
    if (!t) return null;
    return { headers: { Authorization: `Bearer ${t}` } };
  };

  // fetch profile (use same endpoint shape as ReleasePage)
  const fetchProfile = async () => {
    try {
      const cfg = authHeader();
      if (!cfg) {
        toast.error("Not authenticated. Please log in.");
        setUser({ name: "Unknown", role: "user" });
        return;
      }
      const res = await api.get(`/api/auth/me`, cfg);
      const data = res.data?.user ?? res.data;
      setUser({
        name: data?.name ?? data?.firstName ?? "Unknown",
        role: (data?.role ?? "user").toString().toLowerCase(),
        // keep full object in case needed
        raw: data,
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      toast.error("Failed to load profile");
      setUser({ name: "Unknown", role: "user" });
    }
  };

  // fetch dashboard summary — waits for user to exist (so role is known)
  const fetchSummary = async (notifyNewLow = true) => {
    if (!user) return;
    try {
      setLoading(true);
      const cfg = authHeader();
      if (!cfg) return;
      const res = await api.get(`/api/dashboard/summary`, cfg);
      const serverSummary = res.data ?? {};
      setSummary((prev) => ({
        ...prev,
        ...serverSummary,
        expectedOverdueTrend: serverSummary.expectedOverdueTrend ?? [],
      }));

      // low stock notifications only for admins
      const isAdmin = ["admin", "superadmin"].includes((user.role || "").toLowerCase());
      if (notifyNewLow && serverSummary.lowStock?.length && isAdmin) {
        const currentIds = new Set(serverSummary.lowStock.map((i) => i._id));
        const prev = lastLowStockIdsRef.current;
        for (const id of currentIds) {
          if (!prev.has(id)) {
            const item = serverSummary.lowStock.find((x) => x._id === id);
            toast(`Low stock: ${item.name} (${item.quantity})`, { icon: "⚠️" });
          }
        }
        lastLowStockIdsRef.current = currentIds;
      }
    } catch (err) {
      console.error("Dashboard summary fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // init: fetch profile, then fetch summary after profile resolves
  useEffect(() => {
    let mounted = true;
    (async () => {
      await fetchProfile();
      // fetchSummary will run in next effect when user is set
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch summary once user is available, and poll
  useEffect(() => {
    if (!user) return;
    fetchSummary();
    const id = setInterval(() => fetchSummary(true), 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const isAdmin = useMemo(() => ["admin", "superadmin"].includes((user?.role || "").toLowerCase()), [user]);
  const isSuperAdmin = useMemo(() => (user?.role || "").toLowerCase() === "superadmin", [user]);

  const { counts, lowStock, topReleased, threshold, expectedOverdueTrend, chartData } = summary;

  // Charts
  const topReleasedSeries = useMemo(() => [
    { name: "Released Quantity", data: (topReleased || []).map((i) => Number(i.totalReleased || 0)) },
  ], [topReleased]);

  const topReleasedCategories = useMemo(() => (topReleased || []).map((i) => i.name || ""), [topReleased]);

  const topReleasedChartOptions = useMemo(() => ({
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { distributed: true, borderRadius: 6, columnWidth: "55%" } },
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    dataLabels: { enabled: false },
    xaxis: { categories: topReleasedCategories, labels: { rotate: -45 } },
    yaxis: { title: { text: "Qty Released" } },
    title: { text: "Top Released Items", align: "center", style: { fontSize: "16px" } },
  }), [topReleasedCategories]);

  const releaseReturnSeries = useMemo(() => [chartData.released || 0, chartData.returned || 0], [chartData]);

  const releaseReturnOptions = useMemo(() => ({
    chart: { type: "donut" },
    labels: ["Released", "Returned"],
    plotOptions: { pie: { donut: { size: "60%" } } },
    tooltip: { y: { formatter: (val) => `${val}` } },
    dataLabels: { enabled: true, formatter: (val) => `${val}%` },
    legend: { position: "bottom" },
  }), []);

  const dashboardTitle = useMemo(() => `${getFriendlyRole(user?.role)} Dashboard`, [user]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      {user ? (
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-800">{dashboardTitle}</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Logged in as: <strong>{user.name}</strong> ({getFriendlyRole(user.role)})
          </p>
        </div>
      ) : (
        <SkeletonLoader height="h-8" width="w-64" />
      )}

      {/* KPI Cards for Admins */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <DashboardCard title="Total Items" value={counts?.totalItems} hint="All items" color="#3B82F6" loading={loading} />
          <DashboardCard title="Total Users" value={counts?.totalUsers} hint="Registered users" color="#10B981" loading={loading} />
          <DashboardCard title="Deleted Items" value={counts?.totalDeletedItems} hint="Deleted / removed" color="#EF4444" loading={loading} />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow p-5 col-span-1 lg:col-span-2">
          {loading ? <SkeletonLoader height="h-[350px]" rounded="rounded-xl" /> :
            (topReleased?.length ? <ReactApexChart options={topReleasedChartOptions} series={topReleasedSeries} type="bar" height={350} /> :
              <div className="text-gray-500">No release data yet.</div>)}
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          {loading ? <SkeletonLoader height="h-[350px]" rounded="rounded-xl" /> :
            <ReactApexChart options={releaseReturnOptions} series={releaseReturnSeries} type="donut" height={350} />}
        </div>
      </div>

      {/* Expected vs Overdue */}
      {expectedOverdueTrend?.length > 0 && (
        <div className="bg-white rounded-xl shadow p-5 mb-8">
          <DateChart data={expectedOverdueTrend} />
        </div>
      )}

      {/* Low Stock for Admins */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow p-5 mb-8">
          <h2 className="font-semibold text-lg mb-3 text-gray-700">Low Stock (≤ {threshold})</h2>
          {loading ? (
            <ul className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <li key={i} className="flex justify-between items-center border rounded-lg p-3">
                  <div className="flex-1">
                    <SkeletonLoader height="h-4" width="w-32" />
                    <SkeletonLoader height="h-3" width="w-20" className="mt-2" />
                  </div>
                  <SkeletonLoader height="h-4" width="w-8" />
                </li>
              ))}
            </ul>
          ) : lowStock?.length ? (
            <ul className="space-y-2">
              {lowStock.map((it) => (
                <li key={it._id} className="flex justify-between items-center border rounded-lg p-2 hover:bg-gray-50 transition">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-gray-500">Qty: {it.quantity} • Added by: {it.addedBy?.name || "Unknown"}</div>
                  </div>
                  <div className="text-sm font-semibold text-red-600">{it.quantity}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No low-stock items.</div>
          )}
        </div>
      )}

      {/* Admin Actions */}
      {isAdmin && !loading && (
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold mb-2 text-gray-700">Admin Actions</h3>
          <p className="text-sm text-gray-600">Manage, release, or delete items in the Inventory Management section.</p>
        </div>
      )}
    </div>
  );
}
