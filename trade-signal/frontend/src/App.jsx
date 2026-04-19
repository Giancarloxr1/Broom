import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { ToastProvider } from './components/ToastContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ChartView from './pages/ChartView.jsx';
import Indicators from './pages/Indicators.jsx';
import SmartMode from './pages/SmartMode.jsx';
import Rules from './pages/Rules.jsx';
import RuleEdit from './pages/RuleEdit.jsx';
import Signals from './pages/Signals.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Trades from './pages/Trades.jsx';
import TradeEdit from './pages/TradeEdit.jsx';
import Settings from './pages/Settings.jsx';

/**
 * Root dell'app. Monta router + provider toast globale.
 * Layout include la bottom tab bar mobile persistente.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="chart" element={<ChartView />} />
            <Route path="chart/:symbol" element={<ChartView />} />
            <Route path="indicators" element={<Indicators />} />
            <Route path="smart" element={<SmartMode />} />
            <Route path="rules" element={<Rules />} />
            <Route path="rules/new" element={<RuleEdit />} />
            <Route path="rules/:id" element={<RuleEdit />} />
            <Route path="signals" element={<Signals />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="trades" element={<Trades />} />
            <Route path="trades/new" element={<TradeEdit />} />
            <Route path="trades/:id" element={<TradeEdit />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
