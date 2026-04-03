import { useState } from "react";
import WelcomeCarAnim from "./WelcomeCarAnim";
import { FI, FC } from "../data/cars";

const OFFERTE_MESE = [
  { id: 3, brand: "Audi", model: "A1", trim: "Sportback", version: "25 TFSI 95cv", cat: "Citycar", canone: 319, canoneIva: 389, anticipo: 500, durata: 36, km: 15000, carburante: "Benzina", pronta: false, shape: "citycar", color: "#1D4ED8" },
  { id: 6, brand: "BMW", model: "Serie 3", trim: "M Sport", version: "318i 156cv", cat: "Berlina", canone: 589, canoneIva: 719, anticipo: 2000, durata: 36, km: 20000, carburante: "Benzina", pronta: false, shape: "berlina", color: "#374151" },
  { id: 39, brand: "Volkswagen", model: "Tiguan", trim: "Elegance", version: "1.5 TSI 150cv", cat: "SUV", canone: 449, canoneIva: 548, anticipo: 1500, durata: 36, km: 20000, carburante: "Benzina", pronta: true, shape: "suv", color: "#065F46" },
  { id: 28, brand: "Renault", model: "Zoe", trim: "Intens", version: "R135 52kWh", cat: "Citycar", canone: 269, canoneIva: 328, anticipo: 0, durata: 36, km: 10000, carburante: "Elettrico", pronta: true, shape: "citycar", color: "#7C3AED" },
];

const QUICK = [
  { l: "⚡ Elettriche" },
  { l: "🌿 Ibride" },
  { l: "🚗 City Car" },
  { l: "🚙 SUV" },
  { l: "BMW" },
  { l: "Volkswagen" },
  { l: "Fiat" },
  { l: "Toyota" },
];

function CarSVG({ shape, color }) {
  const paths = {
    citycar: "M30,50 Q35,30 60,28 Q90,26 115,30 L125,50 Q100,44 60,44 Q35,44 30,50Z M35,50 Q33,58 40,62 Q47,66 55,62 Q62,58 60,50Z M100,50 Q98,58 105,62 Q112,66 120,62 Q127,58 125,50Z",
    berlina: "M20,52 Q28,28 65,25 Q100,22 130,30 L140,52 Q115,46 70,46 Q30,46 20,52Z M25,52 Q23,61 31,65 Q39,69 48,65 Q56,61 54,52Z M110,52 Q108,61 116,65 Q124,69 133,65 Q141,61 139,52Z",
    suv: "M18,55 Q22,28 60,24 Q100,20 132,28 L142,55 Q118,48 72,48 Q28,48 18,55Z M23,55 Q21,65 30,70 Q39,74 49,70 Q58,65 56,55Z M113,55 Q111,65 120,70 Q129,74 139,70 Q148,65 146,55Z M40,24 L40,16 Q60,14 100,14 L100,24Z",
    commerciale: "M15,56 Q15,28 45,25 L130,25 L140,40 L142,56 Q118,50 75,50 Q30,50 15,56Z M20,56 Q18,66 27,71 Q36,75 46,71 Q55,66 53,56Z M115,56 Q113,66 122,71 Q131,75 141,71 Q150,66 148,56Z",
  };
  return (
    <svg viewBox="0 0 165 90" style={{ width: "100%", maxWidth: 220, height: "auto", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))" }}>
      <defs>
        <linearGradient id={`g${shape}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`w${shape}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path d={paths[shape] || paths.berlina} fill={`url(#g${shape})`} stroke={color} strokeWidth="1" />
      <path d={paths[shape] || paths.berlina} fill={`url(#wberlina)`} opacity="0.15" />
      <circle cx="43" cy="64" r="10" fill="#1F2937" stroke="#374151" strokeWidth="1.5" />
      <circle cx="43" cy="64" r="5" fill="#6B7280" />
      <circle cx="120" cy="64" r="10" fill="#1F2937" stroke="#374151" strokeWidth="1.5" />
      <circle cx="120" cy="64" r="5" fill="#6B7280" />
      <ellipse cx="82" cy="36" rx="25" ry="8" fill="#BFDBFE" opacity="0.5" />
    </svg>
  );
}

export default function WelcomeScreen({ pratiche, onStartClient, onDealerHow, onMieRichieste }) {
  const [ivaIncl, setIvaIncl] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6F9", fontFamily: "'Trebuchet MS',sans-serif" }}>
      <nav style={{ background: "#1A1A2E", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#FF5733,#FF8C00)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🏎</div>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>broom</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: "#FF5733", background: "rgba(255,87,51,0.15)", border: "1px solid rgba(255,87,51,0.3)", borderRadius: 4, padding: "2px 5px" }}>BETA</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {pratiche.length > 0 && (
            <button onClick={onMieRichieste} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 7, padding: "6px 12px", color: "#fff", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
              📋 Le mie richieste ({pratiche.length})
            </button>
          )}
          <button onClick={onDealerHow} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 7, padding: "6px 12px", color: "#fff", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
            Sei un dealer?
          </button>
        </div>
      </nav>

      <div style={{ background: "linear-gradient(155deg,#1A1A2E 0%,#0F3460 60%,#1A1A2E 100%)", padding: "36px 20px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,transparent,transparent 40px,rgba(255,87,51,0.03) 40px,rgba(255,87,51,0.03) 41px)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <h1
            style={{
              fontSize: "clamp(56px,17vw,108px)",
              fontWeight: 900,
              margin: "0 0 2px",
              lineHeight: 0.92,
              letterSpacing: "-0.045em",
              background: "linear-gradient(180deg,#FFFFFF 12%,#FFB088 52%,#FF5733 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            broom
          </h1>
          <WelcomeCarAnim />
          <p style={{ color: "#E2E8F0", fontSize: "clamp(14px,3.5vw,17px)", margin: "0 0 14px", fontWeight: 600 }}>Noleggio lungo termine · Offerte reali dai dealer italiani</p>
          <div style={{ maxWidth: 520, margin: "0 auto 28px" }}>
            <p style={{ color: "#94A3B8", fontSize: 13, lineHeight: 1.75, margin: 0 }}>
              <span style={{ color: "#FFAB90", fontWeight: 700 }}>Prezzi reali e trasparenti</span>
              <span style={{ opacity: 0.35, margin: "0 0.55em" }}>·</span>
              <span style={{ color: "#CBD5E1" }}>Risposta entro 24 ore</span>
              <span style={{ opacity: 0.35, margin: "0 0.55em" }}>·</span>
              <span style={{ color: "#CBD5E1" }}>40+ auto disponibili</span>
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 560, margin: "0 auto 24px", position: "relative" }}>
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onStartClient()}
            placeholder="Marca, modello o caratteristica: 'ibrido', 'SUV sotto 400€'..."
            style={{ width: "100%", padding: "14px 52px 14px 18px", borderRadius: 12, border: "none", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
          />
          <button
            onClick={onStartClient}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "linear-gradient(135deg,#FF5733,#FF8C00)", border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            🔍
          </button>
        </div>

        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p style={{ color: "#5A6680", fontSize: 11, fontWeight: 600, letterSpacing: "1px", marginBottom: 12 }}>LE RICERCHE PIÙ FREQUENTI</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {QUICK.map((q) => (
              <button
                key={q.l}
                onClick={onStartClient}
                style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "7px 16px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,87,51,0.15)"; e.currentTarget.style.borderColor = "rgba(255,87,51,0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              >
                {q.l} <span style={{ opacity: 0.5 }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: "clamp(18px,4vw,24px)", fontWeight: 900, color: "#1A1A2E", margin: "0 0 4px" }}>LE OFFERTE DEL MESE</h2>
            <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Scopri le migliori offerte in pronta consegna. Servizi inclusi: RCA, Kasko, Manutenzione, Assistenza H24.</p>
          </div>
          <button
            onClick={onStartClient}
            style={{ background: "linear-gradient(135deg,#FF5733,#FF8C00)", border: "none", borderRadius: 8, padding: "9px 18px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
          >
            Scopri tutte le offerte →
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, margin: "0 0 18px 0", padding: "12px 16px", background: "linear-gradient(135deg,#F8FAFC,#EFF6FF)", borderRadius: 14, border: "1px solid #E2E8F0" }}>
          <span style={{ fontSize: 11, color: "#475569", fontWeight: 700, marginRight: "auto" }}>Canoni nelle schede sotto</span>
          <span style={{ fontSize: 11, color: !ivaIncl ? "#1A1A2E" : "#94A3B8", fontWeight: !ivaIncl ? 700 : 500 }}>IVA esclusa</span>
          <button type="button" onClick={() => setIvaIncl(!ivaIncl)} style={{ width: 44, height: 24, borderRadius: 12, background: ivaIncl ? "linear-gradient(135deg,#FF5733,#FF8C00)" : "#CBD5E1", border: "none", cursor: "pointer", position: "relative", flexShrink: 0 }}>
            <div style={{ width: 18, height: 18, background: "#fff", borderRadius: "50%", position: "absolute", top: 3, left: ivaIncl ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
          </button>
          <span style={{ fontSize: 11, color: ivaIncl ? "#FF5733" : "#94A3B8", fontWeight: ivaIncl ? 700 : 500 }}>IVA inclusa</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,260px),1fr))", gap: 16 }}>
          {OFFERTE_MESE.map((car) => (
            <div
              key={car.id}
              style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", cursor: "pointer", transition: "transform 0.2s,box-shadow 0.2s", display: "flex", flexDirection: "column", minHeight: 440 }}
              onClick={onStartClient}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.14)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.08)"; }}
            >
              <div style={{ background: "linear-gradient(135deg,#0F1923,#1A2744)", padding: "24px 16px 16px", display: "flex", flexDirection: "column", alignItems: "center", minHeight: 130, position: "relative" }}>
                {car.pronta && <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(16,185,129,0.9)", borderRadius: 20, padding: "2px 8px", fontSize: 8, fontWeight: 700, color: "#fff" }}>⚡ Pronta consegna</span>}
                <span style={{ position: "absolute", top: 10, right: 10, background: `${FC[car.carburante] || "#374151"}33`, border: `1px solid ${FC[car.carburante] || "#374151"}`, borderRadius: 20, padding: "2px 7px", fontSize: 8, fontWeight: 700, color: FC[car.carburante] || "#fff" }}>
                  {FI[car.carburante] || ""} {car.carburante}
                </span>
                <CarSVG shape={car.shape} color={car.color} />
              </div>

              <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, margin: "0 0 2px 0" }}>{car.brand.toUpperCase()}</p>
                <p style={{ fontSize: 15, fontWeight: 900, color: "#1A1A2E", margin: "0 0 1px 0" }}>
                  {car.model} <span style={{ color: "#FF5733", fontWeight: 700 }}>{car.trim}</span>
                </p>
                <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 12px 0" }}>{car.version}</p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 10, color: "#94A3B8", margin: "0 0 1px 0" }}>{ivaIncl ? "IVA INCLUSA" : "IVA ESCLUSA"}</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                      <span style={{ fontSize: 30, fontWeight: 900, color: "#1A1A2E", lineHeight: 1 }}>{(ivaIncl ? car.canoneIva : car.canone).toLocaleString("it-IT")}</span>
                      <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>€/mese</span>
                    </div>
                    <p style={{ fontSize: 10, color: "#64748B", margin: "2px 0 0 0" }}>
                      Anticipo €{car.anticipo.toLocaleString("it-IT")} · {car.durata}m · {car.km / 1000}k km
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
                  {["RCA", "Kasko", "Manutenzione", "Assist. H24"].map((s) => (
                    <span key={s} style={{ background: "#F0FDF4", borderRadius: 4, padding: "2px 6px", fontSize: 8, color: "#16A34A", fontWeight: 600 }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", gap: 8 }}>
                  <button onClick={(e) => { e.stopPropagation(); onStartClient(); }} style={{ flex: 1, background: "#1A1A2E", border: "none", borderRadius: 8, padding: "10px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    Blocca offerta
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onStartClient(); }} style={{ flex: 1, background: "linear-gradient(135deg,#FF5733,#FF8C00)", border: "none", borderRadius: 8, padding: "10px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    Richiedi preventivo
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", padding: "32px 20px", textAlign: "center", marginTop: 20 }}>
        <p style={{ color: "#fff", fontSize: "clamp(16px,4vw,20px)", fontWeight: 900, margin: "0 0 8px" }}>Dealer? Pubblica le tue offerte su broom.</p>
        <p style={{ color: "#5A6680", fontSize: 13, margin: "0 0 16px" }}>Raggiungi migliaia di clienti qualificati. Zero costi fissi.</p>
        <button onClick={onDealerHow} style={{ background: "linear-gradient(135deg,#FF5733,#FF8C00)", border: "none", borderRadius: 10, padding: "12px 28px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Registrati come dealer →
        </button>
      </div>
    </div>
  );
}
