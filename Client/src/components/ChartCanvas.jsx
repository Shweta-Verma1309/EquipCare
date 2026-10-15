/* Thin Chart.js wrapper: builds the chart once per data/theme change and destroys it on cleanup. */
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export const cssVar = n => typeof document === 'undefined' ? '' : getComputedStyle(document.documentElement).getPropertyValue(n).trim();

export default function ChartCanvas({ id, label, type, data, options, themeKey }) {
  const ref = useRef(null);
  const key = JSON.stringify(data) + (themeKey || '');
  useEffect(() => {
    Chart.defaults.color = cssVar('--muted');
    Chart.defaults.font.family = "'IBM Plex Sans',system-ui,sans-serif";
    Chart.defaults.font.size = 12;
    const chart = new Chart(ref.current, { type, data, options: { responsive: true, maintainAspectRatio: false, ...options } });
    return () => chart.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return <div className="chart-box sm"><canvas id={id} ref={ref} role="img" aria-label={`${label} chart`} /></div>;
}
