import { S } from "./BaseComponents";

export default function BasketPanel({ basket, setBasket, showPanel, setShowPanel, fuoriL, setFuoriL, onAddFuori, onInvia }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, fontFamily: "'Trebuchet MS',sans-serif" }}>
      {showPanel && (
        <div style={{ background: "#fff", borderTop: "1px solid #E2E8F0", padding: "16px", boxShadow: "0 -8px 30px rgba(0,0,0,0.12)", maxHeight: "65vh", overflowY: "auto" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#1A1A2E", margin: 0 }}>🛒 Selezione preventivi</p>
              <button onClick={() => setShowPanel(false)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94A3B8" }}>✕</button>
            </div>
            {basket.length === 0 ? (
              <p style={{ color: "#94A3B8", fontSize: 12, margin: "0 0 14px 0" }}>Nessuna auto selezionata. Clicca "＋ Seleziona" sulle card.</p>
            ) : (
              basket.map((c) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8FAFC", borderRadius: 9, padding: "10px 12px", marginBottom: 7, border: "1.5px solid #E2E8F0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ fontSize: 20 }}>{c.emoji || "🚗"}</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#1A1A2E", margin: "0 0 1px 0" }}>{c.brand} {c.model} {c.trim}</p>
                      <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>{c.version || "Fuori catalogo"}{c.canone > 0 ? ` · €${c.canone}/mese` : ""}</p>
                    </div>
                  </div>
                  <button onClick={() => setBasket((p) => p.filter((x) => x.id !== c.id))} style={{ background: "#FEE2E2", border: "none", borderRadius: 6, padding: "4px 9px", color: "#DC2626", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                    ✕
                  </button>
                </div>
              ))
            )}
            <div style={{ background: "#FFF7F5", border: "1.5px solid #FFD5CB", borderRadius: 10, padding: "13px", marginTop: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#FF5733", margin: "0 0 10px 0" }}>＋ Aggiungi auto non in catalogo</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 9, color: "#64748B", display: "block", marginBottom: 3 }}>Brand</label>
                  <input value={fuoriL.brand} onChange={(e) => setFuoriL({ ...fuoriL, brand: e.target.value })} placeholder="es. Mazda" style={S.inp} onFocus={S.fo} onBlur={S.bl} />
                </div>
                <div>
                  <label style={{ fontSize: 9, color: "#64748B", display: "block", marginBottom: 3 }}>Modello</label>
                  <input value={fuoriL.model} onChange={(e) => setFuoriL({ ...fuoriL, model: e.target.value })} placeholder="es. CX-5" style={S.inp} onFocus={S.fo} onBlur={S.bl} />
                </div>
              </div>
              <div style={{ marginBottom: 9 }}>
                <label style={{ fontSize: 9, color: "#64748B", display: "block", marginBottom: 3 }}>Versione / note</label>
                <input value={fuoriL.note} onChange={(e) => setFuoriL({ ...fuoriL, note: e.target.value })} placeholder="es. 2.5 AWD Excellence" style={S.inp} onFocus={S.fo} onBlur={S.bl} />
              </div>
              <button onClick={onAddFuori} disabled={!fuoriL.brand || !fuoriL.model} style={{ ...S.btnSm(!!(fuoriL.brand && fuoriL.model)), width: "100%", padding: "9px", fontSize: 12 }}>
                Aggiungi alla selezione
              </button>
            </div>
            {basket.length > 0 && (
              <button onClick={() => { setShowPanel(false); onInvia(); }} style={{ ...S.btn(true), marginTop: 14, fontSize: 13 }}>
                Richiedi preventivo per {basket.length} auto →
              </button>
            )}
          </div>
        </div>
      )}
      <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", padding: "10px 16px", boxShadow: "0 -4px 20px rgba(0,0,0,0.25)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <button onClick={() => setShowPanel(!showPanel)} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", flex: 1, padding: 0 }}>
            <p style={{ color: "#FF8C70", fontSize: 10, fontWeight: 700, margin: "0 0 1px 0" }}>
              {basket.length > 0 ? `${basket.length} auto selezionate` : "Selezione multipla"}
            </p>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, margin: 0 }}>
              {basket.length > 0 ? basket.map((c) => `${c.brand} ${c.model}`).join(" · ") : "Tocca per selezionare più auto o aggiungerne fuori catalogo"}
            </p>
          </button>
          <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
            <button onClick={() => setShowPanel(!showPanel)} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 7, padding: "7px 11px", color: "#fff", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
              {showPanel ? "▼" : "▲"}
            </button>
            {basket.length > 0 && (
              <button onClick={() => { setShowPanel(false); onInvia(); }} style={{ background: "linear-gradient(135deg,#FF5733,#FF8C00)", border: "none", borderRadius: 7, padding: "7px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Richiedi →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
