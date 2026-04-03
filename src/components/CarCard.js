import { FI, FC } from "../data/cars";

export default function CarCard({ car, inBasket, onToggle, ivaInclC, showBtn, onSelectPrev }) {
  return (
    <div style={{ background: "#fff", borderRadius: 13, border: `1.5px solid ${inBasket ? "#FF5733" : "#EAEEF3"}`, overflow: "hidden", transition: "border-color 0.2s", display: "flex", flexDirection: "column", minHeight: 320 }}>
      <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", padding: "12px 13px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 28 }}>{car.emoji}</div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#8896B0", fontSize: 8, margin: "0 0 1px 0" }}>{car.brand.toUpperCase()}</p>
            <p style={{ color: "#fff", fontSize: 13, fontWeight: 900, margin: "0 0 1px 0" }}>
              {car.model} <span style={{ color: "#FF8C70", fontSize: 10 }}>{car.trim}</span>
            </p>
            <p style={{ color: "#5A6680", fontSize: 9, margin: 0 }}>{car.version}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 7, flexWrap: "wrap" }}>
          <span style={{ background: car.pronta ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)", border: `1px solid ${car.pronta ? "rgba(16,185,129,0.4)" : "rgba(245,158,11,0.4)"}`, borderRadius: 20, padding: "1px 6px", fontSize: 8, fontWeight: 700, color: car.pronta ? "#10B981" : "#F59E0B" }}>
            {car.pronta ? "⚡ Pronta" : "📋 " + car.consegna}
          </span>
          {car.carburante && (
            <span style={{ background: `${FC[car.carburante] || "#64748B"}22`, border: `1px solid ${FC[car.carburante] || "#64748B"}44`, borderRadius: 20, padding: "1px 6px", fontSize: 8, fontWeight: 700, color: FC[car.carburante] || "#64748B" }}>
              {FI[car.carburante] || ""} {car.carburante}
            </span>
          )}
        </div>
      </div>
      <div style={{ padding: "11px 13px", flex: 1, display: "flex", flexDirection: "column" }}>
        {car.canone > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 7 }}>
            <div>
              <p style={{ fontSize: 8, color: "#B0BEC5", margin: "0 0 1px 0" }}>Canone mensile da · {ivaInclC ? "IVA INCLUSA" : "IVA ESCLUSA"}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                <span style={{ fontSize: 23, fontWeight: 900, background: "linear-gradient(135deg,#FF5733,#FF8C00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  €{ivaInclC ? Math.round(car.canone * 1.22) : car.canone}
                </span>
                <span style={{ color: "#B0BEC5", fontSize: 10 }}>/mese</span>
              </div>
              <p style={{ fontSize: 9, color: "#C4CDD6", margin: 0 }}>{car.anticipo > 0 ? `Anticipo €${car.anticipo}` : "Senza anticipo"}</p>
            </div>
            {car.risparmio > 0 && (
              <div style={{ background: "#F0FDF6", border: "1.5px solid #C6F6D5", borderRadius: 7, padding: "4px 7px", textAlign: "center" }}>
                <p style={{ fontSize: 7, color: "#22C55E", fontWeight: 600, margin: 0 }}>RISPARMI</p>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#16A34A", margin: 0 }}>€{car.risparmio}</p>
                <p style={{ fontSize: 7, color: "#22C55E", margin: 0 }}>al mese</p>
              </div>
            )}
          </div>
        )}
        {car.colore && (
          <div style={{ display: "flex", gap: 3, marginBottom: 8, flexWrap: "wrap" }}>
            {[`📅 ${car.durata}m`, `🛣 ${car.km / 1000}k km`, `🎨 ${car.colore}`].map((d) => (
              <span key={d} style={{ background: "#F4F6F9", borderRadius: 5, padding: "2px 5px", fontSize: 8, color: "#6B7A8D" }}>
                {d}
              </span>
            ))}
          </div>
        )}
        {car.assic && (car.assic.kasko || car.assic.assist || car.assic.pneumatici || car.assic.autoSost) && (
          <div style={{ background: "#F8FAFC", borderRadius: 7, padding: "8px 10px", marginBottom: 8 }}>
            <p style={{ fontSize: 8, fontWeight: 700, color: "#94A3B8", margin: "0 0 5px 0", letterSpacing: "0.5px" }}>COPERTURA INCLUSA</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {car.assic.kasko && <span style={{ background: "#EFF6FF", borderRadius: 20, padding: "2px 8px", fontSize: 9, color: "#1E40AF", fontWeight: 600 }}>🛡 Kasko (fr. €{car.assic.franchigia})</span>}
              <span style={{ background: "#F0FDF4", borderRadius: 20, padding: "2px 8px", fontSize: 9, color: "#065F46", fontWeight: 600 }}>✅ RCA</span>
              {car.assic.assist && <span style={{ background: "#F0FDF4", borderRadius: 20, padding: "2px 8px", fontSize: 9, color: "#065F46", fontWeight: 600 }}>🔧 Assist. {car.assic.assist}</span>}
              {car.assic.pneumatici && <span style={{ background: "#F0FDF4", borderRadius: 20, padding: "2px 8px", fontSize: 9, color: "#065F46", fontWeight: 600 }}>🔄 Pneumatici</span>}
              {car.assic.autoSost && <span style={{ background: "#F0FDF4", borderRadius: 20, padding: "2px 8px", fontSize: 9, color: "#065F46", fontWeight: 600 }}>🚗 Auto sost.</span>}
            </div>
          </div>
        )}
        <div style={{ marginTop: "auto", paddingTop: 10 }}>
          {showBtn && (
            <button onClick={() => onToggle(car)} style={{ width: "100%", background: inBasket ? "#1A1A2E" : "linear-gradient(135deg,#FF5733,#FF8C00)", border: "none", borderRadius: 8, padding: "10px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {inBasket ? "✓ Selezionata — Rimuovi" : "＋ Seleziona per preventivo"}
            </button>
          )}
          {!showBtn && (
            <button onClick={() => onSelectPrev(car)} style={{ width: "100%", background: "linear-gradient(135deg,#FF5733,#FF8C00)", border: "none", borderRadius: 8, padding: "10px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Richiedi preventivo →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
