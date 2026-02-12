import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

export default function DateChart({ data }) {
  const series = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return [
      {
        name: 'Expected',
        data: data.map(d => ({
          x: new Date(d.date).getTime(),
          y: typeof d.expected === 'number' ? d.expected : 0,
        })),
      },
      {
        name: 'Overdue',
        data: data.map(d => ({
          x: new Date(d.date).getTime(),
          y: typeof d.overdue === 'number' ? d.overdue : 0,
        })),
      },
    ];
  }, [data]);

  const chartOptions = useMemo(() => ({
    chart: {
      type: 'area',
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    stroke: { curve: 'smooth' },
    xaxis: {
      type: 'datetime',
      labels: { format: 'dd MMM' },
    },
    yaxis: {
      title: { text: 'Count' },
    },
    tooltip: {
      x: { format: 'dd MMM yyyy' },
    },
    fill: { opacity: 0.5 },
    legend: { position: 'top', horizontalAlign: 'left' },
  }), []);

  // Debug series too
  console.log('DateChart series:', series);

  return (
    <ReactApexChart
      options={chartOptions}
      series={series}
      type="area"
      height={350}
    />
  );
}
