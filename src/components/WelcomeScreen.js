import { useState } from "react";

const NAV_LINKS = ["Marketplace", "Noleggio", "Flotta", "Supporto"];

const FEATURES = [
  { icon: "🔄", text: "Sincronizzazione immediata contratti", color: "#3B82F6" },
  { icon: "🔔", text: "Alert automatici scadenze e bolli", color: "#F59E0B" },
  { icon: "📊", text: "Reporting avanzato TCO", color: "#8B5CF6" },
];

export default function WelcomeScreen({ pratiche, onStartClient, onDealerHow, onMieRichieste }) {
  const [activeLink, setActiveLink] = useState("Marketplace");

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6F9", fontFamily: "'Trebuchet MS',sans-serif" }}>

      {/* NAVBAR */}
      <nav style={{ background: "#fff", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#1A1A2E", letterSpacing: "-1px" }}>Broom</span>
          {NAV_LINKS.map((l) => (
            <button key={l} onClick={() => { setActiveLink(l); if (l === "Flotta") onMieRichieste(); else onStartClient(); }}
              style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: activeLink === l ? "#FF5733" : "#64748B", cursor: "pointer", fontFamily: "inherit", padding: "4px 0", borderBottom: activeLink === l ? "2px solid #FF5733" : "2px solid transparent" }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", background: "#F1F5F9", borderRadius: 8, padding: "7px 14px", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#94A3B8" }}>🔍</span>
            <input placeholder="Cerca veicolo..." style={{ border: "none", background: "none", outline: "none", fontSize: 12, color: "#1A1A2E", fontFamily: "inherit", width: 120 }} />
          </div>
          <button onClick={onStartClient} style={{ background: "#FF5733", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Scarica Software
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(155deg,#0a0a14 0%,#1A1A2E 40%,#0F3460 100%)", padding: "80px 32px 72px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 50%, rgba(15,52,96,0.6) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: "55%", height: "100%", background: "linear-gradient(135deg, rgba(26,26,46,0.3), rgba(15,52,96,0.5))", clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "15%", right: "8%", width: 180, height: 90, borderRadius: 12, background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))", border: "1px solid rgba(59,130,246,0.2)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "22%", right: "12%", width: 140, height: 70, borderRadius: 8, background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(6,182,212,0.03))", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 700 }}>
          <p style={{ color: "#FF5733", fontSize: 14, fontWeight: 700, margin: "0 0 12px", letterSpacing: "1px" }}>Broom</p>
          <div style={{ width: 40, height: 3, background: "#FF5733", borderRadius: 2, marginBottom: 16 }} />
          <h1 style={{ fontSize: "clamp(36px, 7vw, 64px)", fontWeight: 900, color: "#fff", margin: "0 0 4px", lineHeight: 1.05 }}>
            Noleggio lungo<br />termine.
          </h1>
          <h1 style={{ fontSize: "clamp(36px, 7vw, 64px)", fontWeight: 900, color: "#FF5733", margin: "0 0 20px", lineHeight: 1.05 }}>
            Finalmente semplice.
          </h1>
          <p style={{ color: "#CBD5E1", fontSize: "clamp(14px, 2.5vw, 16px)", margin: "0 0 32px", maxWidth: 500, lineHeight: 1.65 }}>
            Scegli la tua prossima auto tra centinaia di modelli pronti per la consegna. Gestione digitale, trasparente e senza sorprese.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button onClick={onStartClient}
              style={{ background: "linear-gradient(135deg,#FF5733,#FF8C00)", border: "none", borderRadius: 10, padding: "14px 28px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
              Esplora Marketplace <span style={{ fontSize: 16 }}>→</span>
            </button>
            <button onClick={onStartClient}
              style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 10, padding: "14px 28px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(8px)" }}>
              Configura ora
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 32px" }}>
        <div style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px" }}>
            <p style={{ color: "#FF5733", fontSize: 11, fontWeight: 800, letterSpacing: "2px", margin: "0 0 8px" }}>DISPONIBILITÀ</p>
            <h2 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 900, color: "#1A1A2E", margin: "0 0 12px", lineHeight: 1.15 }}>
              Oltre 500 veicoli in pronta consegna.
            </h2>
            <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, margin: 0, maxWidth: 380 }}>
              Dalle citycar alle ammiraglie elettriche, la flotta Broom è pronta a soddisfare ogni esigenza aziendale e privata.
            </p>
          </div>

          <div style={{ flex: "0 0 auto", opacity: 0.12, fontSize: 120, lineHeight: 1 }}>🚗</div>

          <div style={{ display: "flex", gap: 16, flex: "1 1 300px", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <div style={{ background: "linear-gradient(135deg,#FF5733,#FF8C00)", borderRadius: 16, padding: "28px 32px", minWidth: 160, color: "#fff" }}>
              <span style={{ fontSize: 28 }}>⚡</span>
              <p style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, margin: "8px 0 4px" }}>100%</p>
              <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, margin: 0 }}>Processo Digital</p>
            </div>
            <div style={{ background: "#1A1A2E", borderRadius: 16, padding: "28px 32px", minWidth: 160, color: "#fff" }}>
              <span style={{ fontSize: 28 }}>✅</span>
              <p style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, margin: "8px 0 4px" }}>0€</p>
              <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.7, margin: 0 }}>Anticipo opzionale</p>
            </div>
          </div>
        </div>
      </div>

      {/* FLEET MANAGEMENT */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px 56px" }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: "48px 40px", boxShadow: "0 4px 32px rgba(0,0,0,0.06)", display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 340px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#FF5733,#FF8C00)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 900 }}>📊</div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: "#1A1A2E", margin: 0 }}>Broom Fleet Management</h3>
            </div>
            <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, margin: "0 0 24px" }}>
              La soluzione definitiva per gestire la tua flotta aziendale. Integrazione nativa con il Marketplace Broom per un monitoraggio in tempo reale, alert intelligenti sulla manutenzione e analisi dei costi granulare.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
              {FEATURES.map((f) => (
                <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${f.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{f.icon}</div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E" }}>{f.text}</span>
                </div>
              ))}
            </div>
            <button onClick={onStartClient}
              style={{ background: "linear-gradient(135deg,#FF5733,#FF8C00)", border: "none", borderRadius: 10, padding: "12px 24px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
              <span>⬇</span> Scarica il Software
            </button>
          </div>

          {/* Dashboard Preview */}
          <div style={{ flex: "1 1 340px", position: "relative" }}>
            <div style={{ background: "linear-gradient(135deg, #0F1923, #1A2744)", borderRadius: 16, padding: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
                <span style={{ fontSize: 10, color: "#475569", marginLeft: 8 }}>Fleet Dashboard</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 12 }}>
                  <p style={{ fontSize: 9, color: "#64748B", margin: "0 0 4px" }}>Veicoli attivi</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>156</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 12 }}>
                  <p style={{ fontSize: 9, color: "#64748B", margin: "0 0 4px" }}>Costo medio</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: "#22C55E", margin: 0 }}>€387</p>
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 12 }}>
                <p style={{ fontSize: 9, color: "#64748B", margin: "0 0 8px" }}>Contratti in scadenza</p>
                <div style={{ display: "flex", gap: 4 }}>
                  {[65, 40, 80, 55, 70, 45, 90].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: h * 0.5, background: `linear-gradient(180deg, ${i === 6 ? "#FF5733" : "#3B82F6"}, ${i === 6 ? "#FF8C00" : "#1D4ED8"})`, borderRadius: 3, opacity: 0.8 }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Alert Card Overlay */}
            <div style={{ position: "absolute", bottom: -12, left: -12, background: "#fff", borderRadius: 12, padding: "10px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 3, height: 36, background: "#EF4444", borderRadius: 2 }} />
              <div>
                <p style={{ fontSize: 8, color: "#EF4444", fontWeight: 800, letterSpacing: "0.5px", margin: "0 0 2px" }}>VEICOLI CON ALERT</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: "#1A1A2E", margin: "0 0 1px" }}>12</p>
                <p style={{ fontSize: 8, fontWeight: 700, color: "#EF4444", margin: 0 }}>Intervento richiesto immediato</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DEALER CTA */}
      <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", padding: "40px 32px", textAlign: "center" }}>
        <p style={{ color: "#fff", fontSize: "clamp(16px,4vw,22px)", fontWeight: 900, margin: "0 0 8px" }}>Dealer? Pubblica le tue offerte su Broom.</p>
        <p style={{ color: "#5A6680", fontSize: 13, margin: "0 0 18px" }}>Raggiungi migliaia di clienti qualificati. Zero costi fissi.</p>
        <button onClick={onDealerHow} style={{ background: "linear-gradient(135deg,#FF5733,#FF8C00)", border: "none", borderRadius: 10, padding: "13px 28px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Registrati come dealer →
        </button>
      </div>
    </div>
  );
}
