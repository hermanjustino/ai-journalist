import { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

export const useChart = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const renderChart = (config: any) => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create new chart
      chartInstance.current = new Chart(chartRef.current, {
        ...config,
        options: {
          ...config.options,
          responsive: true,
          maintainAspectRatio: false,
          resizeDelay: 100
        }
      });
    }
  };

  // Clean up chart on unmount
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return { chartRef, renderChart };
};