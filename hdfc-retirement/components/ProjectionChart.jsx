'use client';

import { useEffect, useRef } from 'react';
import { formatINR } from '@/lib/calculator';

export default function ProjectionChart({ data, type, labels }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    import('chart.js/auto').then(mod => {
      const Chart = mod.default;
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      const baseFont = { family: 'Montserrat, Arial, Verdana, sans-serif' };

      const tooltipPlugin = {
        backgroundColor: '#fff',
        titleColor: '#12213a',
        bodyColor: '#3a4a63',
        borderColor: '#dde3ee',
        borderWidth: 1,
        padding: 12,
        titleFont: { ...baseFont, size: 12, weight: '700' },
        bodyFont: { ...baseFont, size: 12 },
        callbacks: { label: ctx => ` ${ctx.dataset.label}: ${formatINR(ctx.raw, true)}` },
      };

      const scaleBase = {
        x: {
          grid: { display: false },
          ticks: { font: { ...baseFont, size: 10 }, color: '#8a96aa', maxRotation: 45 },
          border: { color: '#dde3ee' },
        },
        y: {
          grid: { color: 'rgba(34,76,135,0.06)' },
          ticks: {
            font: { ...baseFont, size: 10 }, color: '#8a96aa',
            callback: v => {
              if (v >= 1e7) return `₹${(v / 1e7).toFixed(1)}Cr`;
              if (v >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`;
              if (v >= 1e3) return `₹${(v / 1e3).toFixed(0)}K`;
              return `₹${v}`;
            },
          },
          border: { color: '#dde3ee' },
        },
      };

      if (type === 'accumulation') {
        chartRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels.filter((_, i) => i % Math.ceil(data.length / 20) === 0 || i === data.length - 1),
            datasets: [
              {
                label: 'Amount Invested',
                data: data.filter((_, i) => i % Math.ceil(data.length / 20) === 0 || i === data.length - 1).map(d => d.invested),
                backgroundColor: 'rgba(34,76,135,0.78)',
                borderColor: '#224c87', borderWidth: 1, borderRadius: 4, stack: 's',
              },
              {
                label: 'Returns Earned',
                data: data.filter((_, i) => i % Math.ceil(data.length / 20) === 0 || i === data.length - 1).map(d => d.returns),
                backgroundColor: 'rgba(201,134,10,0.75)',
                borderColor: '#c9860a', borderWidth: 1, borderRadius: 4, stack: 's',
              },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 2.2,
            plugins: {
              legend: { labels: { font: { ...baseFont, size: 12 }, color: '#3a4a63', usePointStyle: true, padding: 16 } },
              tooltip: { ...tooltipPlugin, callbacks: { ...tooltipPlugin.callbacks, footer: items => `Total: ${formatINR(items.reduce((s, i) => s + i.raw, 0), true)}` } },
            },
            scales: { ...scaleBase, x: { ...scaleBase.x, stacked: true }, y: { ...scaleBase.y, stacked: true } },
            animation: { duration: 700, easing: 'easeInOutQuart' },
          },
        });
      } else if (type === 'depletion') {
        chartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels.filter((_, i) => i % Math.ceil(data.length / 15) === 0 || i === data.length - 1),
            datasets: [
              {
                label: 'Corpus Balance',
                data: data.filter((_, i) => i % Math.ceil(data.length / 15) === 0 || i === data.length - 1).map(d => d.balance),
                borderColor: '#224c87', backgroundColor: 'rgba(34,76,135,0.08)',
                fill: true, tension: 0.35, pointRadius: 3,
                pointBackgroundColor: '#224c87', borderWidth: 2,
              },
              {
                label: 'Annual Withdrawal',
                data: data.filter((_, i) => i % Math.ceil(data.length / 15) === 0 || i === data.length - 1).map(d => d.withdrawal),
                borderColor: '#da3832', borderDash: [6, 4],
                backgroundColor: 'transparent', tension: 0.3,
                pointRadius: 2, pointBackgroundColor: '#da3832', borderWidth: 1.5,
              },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 2.2,
            plugins: {
              legend: { labels: { font: { ...baseFont, size: 12 }, color: '#3a4a63', usePointStyle: true, padding: 16 } },
              tooltip: tooltipPlugin,
            },
            scales: scaleBase,
            animation: { duration: 700, easing: 'easeInOutQuart' },
          },
        });
      }
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [data, type, labels]);

  return (
    <div className="chart-box">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={
          type === 'accumulation'
            ? 'Stacked bar chart showing yearly corpus accumulation: blue for invested amount, gold for returns'
            : 'Line chart showing corpus balance during retirement and annual withdrawals'
        }
      />
      <p className="sr-only">
        {type === 'accumulation'
          ? 'Year-by-year corpus build-up chart. View the Year-wise Table tab for detailed numbers.'
          : 'Retirement withdrawal phase chart showing corpus balance decreasing over time. Corpus may deplete if balance reaches zero.'}
      </p>
    </div>
  );
}
