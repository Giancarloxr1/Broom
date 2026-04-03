import { useState } from "react";
import { S, Header } from "./BaseComponents";
import { CARS } from "../data/cars";

export default function DealerMain({ dealer, onBack }) {
  const [tab, setTab] = useState("richieste");
  const [offForm, setOffForm] = useState({
    canone: "",
    anticipo: "",
    durata: "",
    km: "",
    tipo: "✅ In linea",
    note: "",
    keepValid: false,
    validDays: 30,
  });
  const [selReq, setSelReq] = useState(null);
  const [reqStatuses, setReqStatuses] = useState({ RQ1: "In attesa", RQ2: "In attesa", RQ3: "Risposto" });
  const [sendSuccess, setSendSuccess] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [docsPriv, setDocsPriv] = useState(["CI valido", "Codice Fiscale", "Ultima busta paga", "Estratto conto 3 mesi", "Patente"]);
  const [docsAz, setDocsAz] = useState(["Visura camerale", "P.IVA e CF", "Bilancio esercizio", "EC aziendale 3 mesi", "CI legale rapp.", "Statuto"]);
  const [emailDoc, setEmailDoc] = useState("preventivi@dealer.it");
  const [newDoc, setNewDoc] = useState("");
  const MAX_VETRINA = 5;
  const [vetrinaIds, setVetrinaIds] = useState([]);
  const [superOfferCarId, setSuperOfferCarId] = useState(null);
  const toggleVetrina = (carId) => {
    setVetrinaIds((prev) => {
      if (prev.includes(carId)) {
        setSuperOfferCarId((s) => (s === carId ? null : s));
        return prev.filter((x) => x !== carId);
      }
      if (prev.length >= MAX_VETRINA) return prev;
      return [...prev, carId];
    });
  };
  const toggleSuper = (carId) => {
    if (!vetrinaIds.includes(carId)) return;
    setSuperOfferCarId((s) => (s === carId ? null : carId));
  };

  const mockReqs = [
    { id: "RQ1", codice: "BRO-A4F2", tipo: "Privato", auto: [{ brand: "BMW", model: "Serie 3", trim: "M Sport" }], budget: 580, km: 20000, durata: 36, data: "oggi", stato: "In attesa", note: "" },
    { id: "RQ2", codice: "BRO-C7K9", tipo: "Azienda", auto: [{ brand: "VW", model: "Tiguan", trim: "Elegance" }, { brand: "VW", model: "Passat", trim: "Business" }], budget: 450, km: 25000, durata: 48, data: "ieri", stato: "In attesa", note: "Flotta 3 veicoli, interesse a tariffe flotta" },
    { id: "RQ3", codice: "BRO-X1M3", tipo: "Privato", auto: [{ brand: "Toyota", model: "Yaris Cross", trim: "Trend" }], budget: 300, km: 10000, durata: 36, data: "2gg fa", stato: "Risposto", note: "" },
  ];

  const liveReqs = mockReqs.map((r) => ({ ...r, stato: reqStatuses[r.id] || r.stato }));
  const reqByTab = liveReqs;
  const totInAttesa = liveReqs.filter((r) => r.stato === "In attesa").length;
  const totRisposto = liveReqs.filter((r) => r.stato === "Risposto").length;

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6F9", fontFamily: "'Trebuchet MS',sans-serif" }}>
      <Header
        onBack={onBack}
        title={dealer.rag || "Dashboard Dealer"}
        right={<span style={{ background: "#F4F6F9", border: "1px solid #E2E8F0", borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 600, color: "#64748B" }}>🏢 Dealer</span>}
      />

      <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", padding: "12px 16px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", gap: 10 }}>
          {[["📩", liveReqs.length, "Richieste totali"], ["⏳", totInAttesa, "In attesa risposta"], ["✅", totRisposto, "Offerte inviate"]].map(([ic, n, l]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 9, padding: "8px 12px", flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 14 }}>{ic}</div>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 900 }}>{n}</div>
              <div style={{ color: "#5A6680", fontSize: 9 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderBottom: "1px solid #EAEEF3", background: "#fff", padding: "0 16px", overflowX: "auto" }}>
        <div style={{ display: "flex", maxWidth: 860, margin: "0 auto" }}>
          {[
            ["richieste", "📋 Richieste"],
            ["offerta", "💼 Rispondi"],
            ["catalogo", "🚗 Catalogo"],
            ["impostazioni", "⚙️ Impostazioni"],
          ].map(([id, l]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: tab === id ? "2.5px solid #FF5733" : "2.5px solid transparent",
                padding: "10px 15px",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                color: tab === id ? "#1A1A2E" : "#8896A6",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "16px" }}>
        {tab === "richieste" && (
          <div>
            <p style={{ color: "#64748B", fontSize: 12, margin: "0 0 14px 0" }}>Le offerte sono anonime — il cliente non sa chi sei fino a quando sceglie la tua offerta.</p>
            {reqByTab.map((req) => (
              <div key={req.id} style={{ background: "#fff", borderRadius: 11, border: `1.5px solid ${req.stato === "In attesa" ? "#FED7AA" : "#E2E8F0"}`, padding: "13px 15px", marginBottom: 9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 8, fontWeight: 700, color: "#FF5733", letterSpacing: "1px" }}>{req.codice}</span>
                      <span style={{ background: req.tipo === "Privato" ? "#EFF6FF" : "#FFF7ED", borderRadius: 20, padding: "1px 8px", fontSize: 9, fontWeight: 700, color: req.tipo === "Privato" ? "#1E40AF" : "#92400E" }}>
                        {req.tipo}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E", margin: "0 0 2px 0" }}>{req.auto.map((a) => `${a.brand} ${a.model}`).join(" · ")}</p>
                    <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>Budget €{req.budget}/mese · {req.km / 1000}k km · {req.durata} mesi</p>
                    {req.note && <p style={{ fontSize: 10, color: "#92400E", margin: "4px 0 0 0", fontStyle: "italic" }}>"{req.note}"</p>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        background: req.stato === "Risposto" ? "#ECFDF5" : "#FFF7ED",
                        border: `1px solid ${req.stato === "Risposto" ? "#A7F3D0" : "#FED7AA"}`,
                        borderRadius: 20,
                        padding: "2px 9px",
                        fontSize: 9,
                        fontWeight: 700,
                        color: req.stato === "Risposto" ? "#065F46" : "#92400E",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {req.stato}
                    </span>
                    <p style={{ fontSize: 9, color: "#B0BEC5", margin: 0 }}>{req.data}</p>
                  </div>
                </div>
                {req.stato === "In attesa" && (
                  <button
                    onClick={() => {
                      setSelReq(req);
                      setTab("offerta");
                    }}
                    style={{ ...S.btnSm(true), width: "100%", padding: "9px", fontSize: 12 }}
                  >
                    Rispondi entro 24h →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "offerta" && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ marginBottom: 14 }}>
              {selReq && (
                <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", borderRadius: 11, padding: "12px 14px" }}>
                  <p style={{ color: "#FF8C70", fontSize: 9, fontWeight: 700, margin: "0 0 2px 0" }}>RICHIESTA {selReq.codice}</p>
                  <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, margin: "0 0 6px 0" }}>{selReq.auto.map((a) => `${a.brand} ${a.model}`).join(" · ")}</p>
                  <p style={{ color: "#94A3B8", fontSize: 10, margin: 0 }}>Budget €{selReq.budget}/mese · {selReq.km / 1000}k km · {selReq.durata} mesi · {selReq.tipo}</p>
                </div>
              )}
            </div>

            <div style={{ background: "#fff", borderRadius: 13, border: "1.5px solid #EAEEF3", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", padding: "15px 18px" }}>
                <p style={{ fontSize: 9, color: "#FF8C70", letterSpacing: "1.5px", fontWeight: 600, margin: "0 0 3px 0" }}>FORMULA OFFERTA</p>
                <h3 style={{ color: "#fff", fontSize: 14, fontWeight: 900, margin: "0 0 2px 0" }}>Risposta rapida — non vincolante</h3>
                <p style={{ color: "#5A6680", fontSize: 10, margin: 0 }}>Il cliente vede la tua offerta in modo anonimo.</p>
              </div>

              <div style={{ padding: "15px 18px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#B0BEC5", letterSpacing: "1px", margin: "0 0 8px 0" }}>TIPO DI RISPOSTA</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                  {[
                    ["✅ In linea", "Rispetti budget e condizioni richieste", "#F0FDF4", "#065F46"],
                    ["💰 Migliorativo prezzo", "Canone inferiore al budget", "#EFF6FF", "#1E40AF"],
                    ["⭐ Migliorativo allestimento", "Allestimento superiore o lieve aumento", "#FFF7ED", "#92400E"],
                  ].map(([v, desc, bg, color]) => (
                    <button
                      key={v}
                      onClick={() => setOffForm({ ...offForm, tipo: v })}
                      style={{
                        background: offForm.tipo === v ? bg : "#F8FAFC",
                        border: `1.5px solid ${offForm.tipo === v ? color + "40" : "#E2E8F0"}`,
                        borderRadius: 8,
                        padding: "9px 12px",
                        textAlign: "left",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <p style={{ fontSize: 11, fontWeight: 700, color: offForm.tipo === v ? color : "#374151", margin: "0 0 1px 0" }}>{v}</p>
                      <p style={{ fontSize: 9, color: "#64748B", margin: 0 }}>{desc}</p>
                    </button>
                  ))}
                </div>

                <p style={{ fontSize: 9, fontWeight: 700, color: "#B0BEC5", letterSpacing: "1px", margin: "0 0 8px 0" }}>CONDIZIONI</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 9 }}>
                  {[
                    ["canone", "Canone €/mese"],
                    ["anticipo", "Anticipo €"],
                    ["durata", "Durata mesi"],
                    ["km", "Km annui"],
                  ].map(([k, l]) => (
                    <div key={k}>
                      <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 3 }}>{l}</label>
                      <input
                        type="number"
                        min="0"
                        value={offForm[k]}
                        onChange={(e) => setOffForm({ ...offForm, [k]: Math.max(0, Number(e.target.value)) || "" })}
                        style={S.inp}
                        onFocus={S.fo}
                        onBlur={S.bl}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 3 }}>Note libere</label>
                  <textarea
                    rows={2}
                    value={offForm.note}
                    onChange={(e) => setOffForm({ ...offForm, note: e.target.value })}
                    style={{ ...S.inp, resize: "vertical" }}
                    onFocus={S.fo}
                    onBlur={S.bl}
                    placeholder="es. Cerchi 19 pollici, pronta in 4 settimane"
                  />
                </div>

                <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "11px 13px", marginBottom: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#1A1A2E", margin: "0 0 1px 0" }}>Mantieni valida per richieste simili?</p>
                      <p style={{ fontSize: 9, color: "#8896A6", margin: 0 }}>Riutilizzata automaticamente</p>
                    </div>
                    <button
                      onClick={() => setOffForm({ ...offForm, keepValid: !offForm.keepValid })}
                      style={{ width: 48, height: 22, borderRadius: 11, background: offForm.keepValid ? "linear-gradient(135deg,#FF5733,#FF8C00)" : "#E2E8F0", border: "none", cursor: "pointer", position: "relative", flexShrink: 0 }}
                    >
                      <div style={{ width: 16, height: 16, background: "#fff", borderRadius: "50%", position: "absolute", top: 3, left: offForm.keepValid ? 26 : 4, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </button>
                  </div>
                  {offForm.keepValid && (
                    <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                      {[7, 15, 30, 60].map((d) => (
                        <button
                          key={d}
                          onClick={() => setOffForm({ ...offForm, validDays: d })}
                          style={{
                            flex: 1,
                            background: offForm.validDays === d ? "#1A1A2E" : "#fff",
                            color: offForm.validDays === d ? "#fff" : "#64748B",
                            border: `1.5px solid ${offForm.validDays === d ? "#1A1A2E" : "#E2E8F0"}`,
                            borderRadius: 6,
                            padding: "6px 5px",
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          {d}gg
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {sendSuccess && (
                  <div style={{ background: "#ECFDF5", border: "1.5px solid #A7F3D0", borderRadius: 9, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>✅</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#065F46", margin: 0 }}>Offerta inviata!</p>
                      <p style={{ fontSize: 10, color: "#047857", margin: 0 }}>Il cliente la riceverà in forma anonima.</p>
                    </div>
                  </div>
                )}
                <button
                  disabled={!offForm.canone}
                  onClick={() => {
                    if (!offForm.canone) return;
                    if (selReq) setReqStatuses((p) => ({ ...p, [selReq.id]: "Risposto" }));
                    setSendSuccess(true);
                    setTimeout(() => {
                      setSendSuccess(false);
                      setTab("richieste");
                      setSelReq(null);
                      setOffForm({ canone: "", anticipo: "", durata: "", km: "", tipo: "✅ In linea", note: "", keepValid: false, validDays: 30 });
                    }, 2000);
                  }}
                  style={S.btn(!!offForm.canone)}
                >
                  Invia offerta →
                </button>
                <p style={{ textAlign: "center", fontSize: 9, color: "#B0BEC5", marginTop: 6, marginBottom: 0 }}>
                  La tua identità rimane anonima finché il cliente non sceglie la tua offerta.
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "catalogo" && (
          <div>
            <p style={{ color: "#64748B", fontSize: 12, margin: "0 0 6px 0" }}>Le auto nel catalogo broom ({CARS.length} disponibili)</p>
            <p style={{ fontSize: 11, color: "#475569", margin: "0 0 14px 0", lineHeight: 1.45 }}>
              Massimo <strong>{MAX_VETRINA} veicoli</strong> in vetrina sul marketplace. Puoi segnare <strong>uno</strong> come <strong>★ super offerta</strong>. Ora: {vetrinaIds.length}/{MAX_VETRINA}
              {superOfferCarId != null ? " · 1 super attiva" : ""}.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,230px),1fr))", gap: 10 }}>
              {CARS.filter((c) => (dealer.brands?.length ? dealer.brands.includes(c.brand) : true) && (dealer.cats?.length ? dealer.cats.includes(c.cat) : true)).map((car) => {
                const inVe = vetrinaIds.includes(car.id);
                const isSuper = superOfferCarId === car.id;
                const vetrinaPiena = vetrinaIds.length >= MAX_VETRINA;
                return (
                  <div key={car.id} style={{ background: "#fff", borderRadius: 11, border: `1.5px solid ${isSuper ? "#F59E0B" : "#EAEEF3"}`, overflow: "hidden" }}>
                    <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", padding: "10px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ color: "#8896B0", fontSize: 8, margin: "0 0 1px 0" }}>{car.brand.toUpperCase()}</p>
                          <p style={{ color: "#fff", fontSize: 12, fontWeight: 800, margin: 0 }}>
                            {car.model} <span style={{ color: "#FF8C70", fontSize: 9 }}>{car.trim}</span>
                          </p>
                        </div>
                        <span style={{ fontSize: 22 }}>{car.emoji}</span>
                      </div>
                    </div>
                    <div style={{ padding: "9px 12px" }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8, minHeight: 22 }}>
                        {inVe && <span style={{ fontSize: 8, fontWeight: 700, background: "#ECFDF5", color: "#065F46", padding: "2px 8px", borderRadius: 20 }}>In vetrina</span>}
                        {isSuper && <span style={{ fontSize: 8, fontWeight: 700, background: "#FFF7ED", color: "#92400E", padding: "2px 8px", borderRadius: 20 }}>★ Super</span>}
                      </div>
                      <p style={{ fontSize: 18, fontWeight: 900, background: "linear-gradient(135deg,#FF5733,#FF8C00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 3px 0" }}>
                        €{car.canone} <span style={{ fontSize: 9, color: "#B0BEC5" }}>/mese</span>
                      </p>
                      <p style={{ fontSize: 9, color: "#94A3B8", margin: "0 0 10px 0" }}>
                        {car.pronta ? "⚡ Pronta" : "📋 " + car.consegna} · {car.km / 1000}k km/anno
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleVetrina(car.id)}
                        disabled={!inVe && vetrinaPiena}
                        style={{
                          width: "100%",
                          background: inVe ? "rgba(30,41,59,0.08)" : vetrinaPiena ? "#F1F5F9" : "#1A1A2E",
                          color: inVe ? "#1A1A2E" : vetrinaPiena ? "#94A3B8" : "#fff",
                          border: "1px solid #E2E8F0",
                          borderRadius: 8,
                          padding: "8px",
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: !inVe && vetrinaPiena ? "not-allowed" : "pointer",
                          fontFamily: "inherit",
                          marginBottom: 6,
                        }}
                      >
                        {inVe ? "Rimuovi da vetrina" : vetrinaPiena ? `Vetrina piena (${MAX_VETRINA}/${MAX_VETRINA})` : "Metti in vetrina"}
                      </button>
                      {inVe && (
                        <button
                          type="button"
                          onClick={() => toggleSuper(car.id)}
                          style={{
                            width: "100%",
                            background: isSuper ? "linear-gradient(135deg,#F59E0B,#EA580C)" : "rgba(245,158,11,0.12)",
                            border: `1px solid ${isSuper ? "#EA580C" : "rgba(245,158,11,0.45)"}`,
                            borderRadius: 8,
                            padding: "8px",
                            fontSize: 10,
                            fontWeight: 700,
                            color: isSuper ? "#fff" : "#92400E",
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          {isSuper ? "★ Rimuovi super offerta" : "★ Segna come super offerta"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "impostazioni" && (
          <div style={{ maxWidth: 520 }}>
            <div style={{ background: "#fff", borderRadius: 13, border: "1.5px solid #EAEEF3", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", padding: "15px 18px" }}>
                <p style={{ fontSize: 9, color: "#FF8C70", letterSpacing: "1.5px", fontWeight: 600, margin: "0 0 3px 0" }}>IMPOSTAZIONI DOCUMENTI</p>
                <h3 style={{ color: "#fff", fontSize: 14, fontWeight: 900, margin: 0 }}>Configura i documenti richiesti al cliente</h3>
              </div>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 4 }}>📧 Email per ricevere i documenti</label>
                  <input value={emailDoc} onChange={(e) => setEmailDoc(e.target.value)} style={S.inp} onFocus={S.fo} onBlur={S.bl} />
                </div>

                {[
                  ["📄 Formalizzazione — PRIVATI", docsPriv, setDocsPriv, "#EFF6FF", "#1E40AF"],
                  ["📄 Formalizzazione — AZIENDE", docsAz, setDocsAz, "#FFF7ED", "#92400E"],
                ].map(([title, docs, setDocs, bg, color]) => (
                  <div key={title} style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color, margin: "0 0 6px 0", padding: "4px 8px", background: bg, borderRadius: 6 }}>{title}</p>
                    {docs.map((d, i) => (
                      <div key={i} style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 4 }}>
                        <input
                          value={d}
                          onChange={(e) => {
                            const n = [...docs];
                            n[i] = e.target.value;
                            setDocs(n);
                          }}
                          style={{ ...S.inp, flex: 1, fontSize: 11 }}
                          onFocus={S.fo}
                          onBlur={S.bl}
                        />
                        <button
                          onClick={() => setDocs(docs.filter((_, j) => j !== i))}
                          style={{ background: "#FEE2E2", border: "none", borderRadius: 6, padding: "6px 8px", color: "#DC2626", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 5, marginTop: 3 }}>
                      <input value={newDoc} onChange={(e) => setNewDoc(e.target.value)} placeholder="Aggiungi documento..." style={{ ...S.inp, flex: 1, fontSize: 11 }} onFocus={S.fo} onBlur={S.bl} />
                      <button
                        onClick={() => {
                          if (newDoc.trim()) {
                            setDocs([...docs, newDoc.trim()]);
                            setNewDoc("");
                          }
                        }}
                        style={{ background: "linear-gradient(135deg,#FF5733,#FF8C00)", border: "none", borderRadius: 7, padding: "0 12px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                {settingsSaved && (
                  <div style={{ background: "#ECFDF5", border: "1.5px solid #A7F3D0", borderRadius: 8, padding: "8px 12px", marginBottom: 8, fontSize: 11, fontWeight: 700, color: "#065F46" }}>
                    ✅ Impostazioni salvate
                  </div>
                )}
                <button
                  onClick={() => {
                    try { localStorage.setItem("broom_dealer_settings", JSON.stringify({ emailDoc, docsPriv, docsAz })); } catch {}
                    setSettingsSaved(true);
                    setTimeout(() => setSettingsSaved(false), 2500);
                  }}
                  style={{ ...S.btn(true), marginTop: 4 }}
                >
                  Salva impostazioni ✓
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
