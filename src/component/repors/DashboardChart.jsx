import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import api from "../../api/API";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/report/chart-data"); // ← you need endpoint
        // Expected: { labels: [...], released: [...], returned: [...], overdue: [...] }
        const { labels, released, returned, overdue } = res.data;

        setChartData({
          labels,
          datasets: [
            {
              label: "Released",
              data: released,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
              stack: "Stack 0"
            },
            {
              label: "Returned",
              data: returned,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
              stack: "Stack 0"
            },
            {
              label: "Overdue",
              data: overdue,
              backgroundColor: "rgba(255, 99, 132, 0.6)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
              stack: "Stack 0"
            }
          ]
        });
      } catch (err) {
        console.error("Error fetching chart data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading chart …</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Released / Returned / Overdue by Category</h3>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: { legend: { position: "top" }, title: { display: true, text: "" } },
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true }
          }
        }}
      />
    </div>
  );
};

export default DashboardChart;
