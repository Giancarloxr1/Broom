import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

// Layout mobile-first con bottom tab bar fissa (5 voci).
// Ogni tab e' un bottone con icona SVG + label, tap area >= 44px.
// Il tab attivo e' evidenziato in arancione.

const TABS = [
  { to: '/', label: 'Home', icon: IconHome, exact: true },
  { to: '/chart', label: 'Grafico', icon: IconChart },
  { to: '/signals', label: 'Segnali', icon: IconBell },
  { to: '/portfolio', label: 'Portafoglio', icon: IconWallet },
  { to: '/settings', label: 'Opzioni', icon: IconGear },
];

/**
 * Wrapper che include <Outlet/> + bottom tab bar fissa.
 * Nessuna prop (consuma router via Outlet).
 */
export default function Layout() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-navy">
      <main className="flex-1 pb-safe pt-3 px-3 max-w-3xl w-full mx-auto">
        <Outlet />
      </main>
      <nav
        className="fixed bottom-0 left-0 right-0 bg-navy-800 border-t border-navy-400
          pb-[env(safe-area-inset-bottom,0)] z-50"
        aria-label="Navigazione principale"
      >
        <ul className="flex justify-around items-stretch max-w-3xl mx-auto">
          {TABS.map((tab) => {
            const active =
              tab.exact
                ? location.pathname === tab.to
                : location.pathname.startsWith(tab.to);
            const Icon = tab.icon;
            return (
              <li key={tab.to} className="flex-1">
                <NavLink
                  to={tab.to}
                  end={tab.exact}
                  className={
                    'flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] ' +
                    (active ? 'text-orange' : 'text-navy-100 hover:text-navy-50')
                  }
                >
                  <Icon active={active} />
                  <span className="text-[11px] font-medium">{tab.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/** Icona Home. */
function IconHome({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

/** Icona Grafico. */
function IconChart({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18" />
      <path d="M6 16V10" />
      <path d="M11 16V6" />
      <path d="M16 16v-8" />
      <path d="M21 16v-4" />
    </svg>
  );
}

/** Icona Bell (segnali). */
function IconBell({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8Z" />
      <path d="M10 21h4" />
    </svg>
  );
}

/** Icona Wallet. */
function IconWallet({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <circle cx="17" cy="15" r="1.2" fill="currentColor" />
    </svg>
  );
}

/** Icona Ingranaggio (settings). */
function IconGear({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2.1 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9c.6.5 1.3.9 2.1 1.2L10 21h4l.5-2.6c.8-.3 1.5-.7 2.1-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
    </svg>
  );
}
