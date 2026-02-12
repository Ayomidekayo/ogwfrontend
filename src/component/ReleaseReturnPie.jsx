import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import api from '../api/API';

function ReleaseReturnPie() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await api.get('/dashboard/summary', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const chartTotals = res.data.chartTotals;
        setData(chartTotals);
      } catch (err) {
        console.error('Error fetching chart totals:', err);
      }
    }
    fetchSummary();
  }, []);

  if (!data) {
    return <p>Loading chart…</p>;
  }

  const series = [data.released, data.returned];
  const options = {
    chart: { type: 'donut' },
    labels: ['Released', 'Returned'],
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}`,
      },
    },
  };

  return (
    <ReactApexChart options={options} series={series} type="donut" width="350" />
  );
}

export default ReleaseReturnPie;
