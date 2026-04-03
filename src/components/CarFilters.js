import { Chip } from "./BaseComponents";
import { BRANDS, CATS, FUELS, FI } from "../data/cars";

const chipGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 132px), 1fr))",
  gap: 6,
  maxHeight: 200,
  overflowY: "auto",
  padding: 4,
  borderRadius: 10,
  border: "1px solid #EDF1F5",
  background: "#FAFBFC",
};

export function CarFilters({ brand, setBrand, model, setModel, modelList, cat, setCat, fuel, setFuel, budget, setBudget, disp, setDisp }) {
  const hasFilters = brand !== "Tutti" || cat !== "Tutti" || fuel !== "Tutti" || disp !== "Tutte" || budget < 900;
  const reset = () => { setBrand("Tutti"); setModel("Tutti"); setCat("Tutti"); setFuel("Tutti"); setBudget(900); setDisp("Tutte"); };

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #EAEEF3", padding: "14px 16px", marginBottom: 14 }}>
      {hasFilters && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button onClick={reset} style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 6, padding: "3px 10px", fontSize: 10, color: "#64748B", cursor: "pointer", fontFamily: "inherit" }}>
            ✕ Reset filtri
          </button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#B0BEC5", letterSpacing: "0.8px", marginBottom: 6 }}>BRAND</div>
          <div style={chipGrid}>
            {BRANDS.map((b) => (
              <Chip key={b} on={brand === b} onClick={() => { setBrand(b); setModel("Tutti"); }}>{b}</Chip>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#B0BEC5", letterSpacing: "0.8px", marginBottom: 6 }}>MODELLO</div>
          <div style={chipGrid}>
            {(brand === "Tutti" ? ["Tutti"] : modelList).map((m) => (
              <Chip key={m} on={model === m} onClick={() => setModel(m)}>{m}</Chip>
            ))}
          </div>
          {brand === "Tutti" && <p style={{ fontSize: 10, color: "#94A3B8", margin: "6px 0 0 0" }}>Scegli un brand per vedere i modelli disponibili.</p>}
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#B0BEC5", letterSpacing: "0.8px", marginBottom: 7 }}>CATEGORIA</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{CATS.map((c) => (<Chip key={c} on={cat === c} onClick={() => setCat(c)}>{c}</Chip>))}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#B0BEC5", letterSpacing: "0.8px", marginBottom: 7 }}>ALIMENTAZIONE</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{FUELS.map((f) => (<Chip key={f} on={fuel === f} onClick={() => setFuel(f)}>{f !== "Tutti" ? FI[f] + " " : ""}{f}</Chip>))}</div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#B0BEC5" }}>BUDGET MAX</div>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#FF5733" }}>€{budget}/mese</span>
          </div>
          <input type="range" min={150} max={950} value={budget} onChange={(e) => setBudget(Number(e.target.value))} style={{ width: "100%", accentColor: "#FF5733", cursor: "pointer" }} />
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#B0BEC5", letterSpacing: "0.8px", marginBottom: 7 }}>DISPONIBILITÀ</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {["Tutte", "⚡ Pronta consegna", "📋 Su ordine"].map((d) => (<Chip key={d} on={disp === d} onClick={() => setDisp(d)}>{d}</Chip>))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function IvaToggle({ ivaInclC, setIvaInclC }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, margin: "0 0 12px 0", padding: "10px 12px", background: "#fff", borderRadius: 10, border: "1px solid #E8EDF2" }}>
      <span style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginRight: "auto" }}>Prezzi in elenco</span>
      <span style={{ fontSize: 11, color: !ivaInclC ? "#1A1A2E" : "#94A3B8", fontWeight: !ivaInclC ? 700 : 500 }}>IVA esclusa</span>
      <button type="button" onClick={() => setIvaInclC(!ivaInclC)} style={{ width: 40, height: 22, borderRadius: 11, background: ivaInclC ? "linear-gradient(135deg,#FF5733,#FF8C00)" : "#E2E8F0", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, padding: 0 }}>
        <div style={{ width: 16, height: 16, background: "#fff", borderRadius: "50%", position: "absolute", top: 3, left: ivaInclC ? 21 : 3, transition: "left 0.2s" }} />
      </button>
      <span style={{ fontSize: 11, color: ivaInclC ? "#FF5733" : "#94A3B8", fontWeight: ivaInclC ? 700 : 500 }}>IVA inclusa</span>
    </div>
  );
}
