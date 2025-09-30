'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  data: any;
  type: 'bar' | 'line' | 'pie';
  title: string;
  height?: number;
}

export default function VisitorChart({ data, type, title, height = 300 }: ChartProps) {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: []
  });

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  };

  useEffect(() => {
    if (!data) return;

    // Handle bar/line charts
    if ((type === 'bar' || type === 'line') && Array.isArray(data)) {
      const labels = data.map((item: any) => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });

      const chartData = {
        labels,
        datasets: [
          {
            label: 'Count',
            data: data.map((item: any) => item.count),
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            borderColor: 'rgb(53, 162, 235)',
            borderWidth: 1,
          },
        ],
      };
      setChartData(chartData);
    }

    // Handle pie charts
    else if (type === 'pie' && Array.isArray(data)) {
      const chartData = {
        labels: data.map((item: any) => item.label || item.purpose || 'Other'),
        datasets: [
          {
            data: data.map((item: any) => item.value || item.count || 0),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
      setChartData(chartData);
    }
  }, [data, type, title]);

  return (
    <div style={{ height: `${height}px` }}>
      {type === 'bar' && <Bar data={chartData} options={chartOptions} />}
      {type === 'line' && <Line data={chartData} options={chartOptions} />}
      {type === 'pie' && <Pie data={chartData} options={chartOptions} />}
    </div>
  );
}
