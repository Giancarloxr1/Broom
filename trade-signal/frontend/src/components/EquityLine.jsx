import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const DARK = {
  layout: { background: { type: 'solid', color: '#1A1A2E' }, textColor: '#B8B9C7' },
  grid: { vertLines: { color: '#24243E' }, horzLines: { color: '#24243E' } },
  rightPriceScale: { borderColor: '#3A3A55' },
  timeScale: { borderColor: '#3A3A55', timeVisible: true, secondsVisible: false },
};

/**
 * Grafico line chart dell'equity curve del portfolio.
 * Props:
 *  - data: array { time: secondi, value: saldo corrente }
 *  - height: altezza pixel (default 240)
 */
export default function EquityLine({ data, height = 240 }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return undefined;
    const chart = createChart(ref.current, {
      ...DARK,
      width: ref.current.clientWidth,
      height,
    });
    chartRef.current = chart;
    const series = chart.addAreaSeries({
      lineColor: '#FF5733',
      topColor: 'rgba(255, 87, 51, 0.4)',
      bottomColor: 'rgba(255, 87, 51, 0.02)',
      lineWidth: 2,
    });
    if (data && data.length) {
      series.setData(data);
      chart.timeScale().fitContent();
    }
    const onResize = () => {
      if (ref.current) chart.applyOptions({ width: ref.current.clientWidth });
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [data, height]);

  const isEmpty = !data || data.length === 0;

  return (
    <div className="w-full relative">
      <div ref={ref} style={{ height }} className="w-full" />
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-navy-100">
          Nessun trade chiuso: la curva si popolera dopo la prima chiusura.
        </div>
      )}
    </div>
  );
}
