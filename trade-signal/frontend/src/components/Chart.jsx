import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

// Wrapper per lightweight-charts (TradingView).
// Disegna candele + overlays opzionali (EMA lines, Bollinger) e sub-panel opzionali
// (RSI, MACD, Stoch RSI) come mini-grafici sincronizzati sopra o sotto.

const DARK_OPTS = {
  layout: {
    background: { type: 'solid', color: '#1A1A2E' },
    textColor: '#B8B9C7',
  },
  grid: {
    vertLines: { color: '#24243E' },
    horzLines: { color: '#24243E' },
  },
  rightPriceScale: { borderColor: '#3A3A55' },
  timeScale: { borderColor: '#3A3A55', timeVisible: true, secondsVisible: false },
  crosshair: { mode: CrosshairMode.Normal },
};

/**
 * Componente grafico candele.
 * Props:
 *  - candles: array { time: seconds, open, high, low, close, volume }
 *  - overlays: { ema20?: [{time, value}], ema50?, ema200?, bbUpper?, bbLower? }
 *  - subpanels: { rsi?: [{time,value}], macd?: {line:[], signal:[], hist:[]}, stochRsi?: {k,d} }
 *  - height: altezza pixel (default 320)
 */
export default function Chart({ candles, overlays = {}, subpanels = {}, height = 320 }) {
  const mainRef = useRef(null);
  const rsiRef = useRef(null);
  const macdRef = useRef(null);
  const stochRef = useRef(null);
  const chartsRef = useRef([]);

  useEffect(() => {
    if (!mainRef.current || !candles) return undefined;
    const mainChart = createChart(mainRef.current, {
      ...DARK_OPTS,
      width: mainRef.current.clientWidth,
      height,
    });
    chartsRef.current = [mainChart];

    const candleSeries = mainChart.addCandlestickSeries({
      upColor: '#22C55E',
      downColor: '#EF4444',
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
      borderVisible: false,
    });
    candleSeries.setData(candles);

    // Overlays EMA / BB
    const addLine = (data, color, lineWidth = 1) => {
      if (!data || !data.length) return;
      const s = mainChart.addLineSeries({ color, lineWidth, priceLineVisible: false });
      s.setData(data);
    };
    addLine(overlays.ema20, '#FF5733');
    addLine(overlays.ema50, '#FFB547');
    addLine(overlays.ema200, '#B8B9C7', 2);
    addLine(overlays.bbUpper, '#3A6EA5');
    addLine(overlays.bbLower, '#3A6EA5');
    addLine(overlays.vwap, '#C084FC');

    // Subpanel RSI
    if (subpanels.rsi && rsiRef.current) {
      const rsiChart = createChart(rsiRef.current, {
        ...DARK_OPTS,
        width: rsiRef.current.clientWidth,
        height: 110,
      });
      chartsRef.current.push(rsiChart);
      const s = rsiChart.addLineSeries({ color: '#FF5733', lineWidth: 2 });
      s.setData(subpanels.rsi);
      const overbought = rsiChart.addLineSeries({ color: '#EF4444', lineWidth: 1 });
      const oversold = rsiChart.addLineSeries({ color: '#22C55E', lineWidth: 1 });
      if (subpanels.rsi.length) {
        overbought.setData(subpanels.rsi.map((p) => ({ time: p.time, value: 70 })));
        oversold.setData(subpanels.rsi.map((p) => ({ time: p.time, value: 30 })));
      }
    }

    // Subpanel MACD
    if (subpanels.macd && macdRef.current) {
      const macdChart = createChart(macdRef.current, {
        ...DARK_OPTS,
        width: macdRef.current.clientWidth,
        height: 110,
      });
      chartsRef.current.push(macdChart);
      if (subpanels.macd.hist) {
        const hist = macdChart.addHistogramSeries({ color: '#3A6EA5' });
        hist.setData(
          subpanels.macd.hist.map((p) => ({
            time: p.time,
            value: p.value,
            color: p.value >= 0 ? '#22C55E' : '#EF4444',
          }))
        );
      }
      if (subpanels.macd.line) {
        const line = macdChart.addLineSeries({ color: '#FF5733', lineWidth: 1 });
        line.setData(subpanels.macd.line);
      }
      if (subpanels.macd.signal) {
        const sig = macdChart.addLineSeries({ color: '#FFB547', lineWidth: 1 });
        sig.setData(subpanels.macd.signal);
      }
    }

    // Subpanel Stoch RSI
    if (subpanels.stochRsi && stochRef.current) {
      const stochChart = createChart(stochRef.current, {
        ...DARK_OPTS,
        width: stochRef.current.clientWidth,
        height: 100,
      });
      chartsRef.current.push(stochChart);
      if (subpanels.stochRsi.k) {
        const k = stochChart.addLineSeries({ color: '#FF5733', lineWidth: 1 });
        k.setData(subpanels.stochRsi.k);
      }
      if (subpanels.stochRsi.d) {
        const d = stochChart.addLineSeries({ color: '#B8B9C7', lineWidth: 1 });
        d.setData(subpanels.stochRsi.d);
      }
    }

    // Resize listener
    const onResize = () => {
      chartsRef.current.forEach((c, idx) => {
        const ref = idx === 0 ? mainRef : idx === 1 ? rsiRef : idx === 2 ? macdRef : stochRef;
        if (ref.current) {
          c.applyOptions({ width: ref.current.clientWidth });
        }
      });
    };
    window.addEventListener('resize', onResize);
    mainChart.timeScale().fitContent();

    return () => {
      window.removeEventListener('resize', onResize);
      chartsRef.current.forEach((c) => c.remove());
      chartsRef.current = [];
    };
  }, [candles, overlays, subpanels, height]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div ref={mainRef} className="w-full" style={{ height }} />
      {subpanels.rsi && (
        <div>
          <div className="text-xs text-navy-100 mb-1">RSI</div>
          <div ref={rsiRef} className="w-full" style={{ height: 110 }} />
        </div>
      )}
      {subpanels.macd && (
        <div>
          <div className="text-xs text-navy-100 mb-1">MACD</div>
          <div ref={macdRef} className="w-full" style={{ height: 110 }} />
        </div>
      )}
      {subpanels.stochRsi && (
        <div>
          <div className="text-xs text-navy-100 mb-1">Stoch RSI</div>
          <div ref={stochRef} className="w-full" style={{ height: 100 }} />
        </div>
      )}
    </div>
  );
}
