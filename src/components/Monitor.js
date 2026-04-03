import { useState, useEffect } from "react";
import { S, Header, Modal } from "./BaseComponents";
import { MOCK_OFFERS, TC, FI } from "../data/cars";

export default function Monitor({ pratica, userType, onBack }) {
  const [offers, setOffers] = useState([]);
  const [selCmp, setSelCmp] = useState([]);
  const [showCmp, setShowCmp] = useState(false);
  const [selOff, setSelOff] = useState(null);
  const [fStep, setFStep] = useState(1);
  const [showF, setShowF] = useState(false);
  const [cd, setCd] = useState(() => {
    try {
      const start = localStorage.getItem(`broom_cd_start_${pratica?.codice}`);
      if (!start) return 86400;
      return Math.max(0, 86400 - Math.floor((Date.now() - parseInt(start)) / 1000));
    } catch { return 86400; }
  });
  const [form, setForm] = useState({
    nome: "",
    cognome: "",
    cf: "",
    piva: "",
    ragSoc: "",
    email: pratica?.email || "",
    telefono: pratica?.telefono || "",
  });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const car = pratica?.cars?.[0] || { brand: "Auto", model: "", trim: "" };
  const lsKey = `broom_offers_${pratica?.codice}`;
  const lsCdKey = `broom_cd_start_${pratica?.codice}`;

  useEffect(() => {
    if (!localStorage.getItem(lsCdKey)) {
      localStorage.setItem(lsCdKey, Date.now().toString());
    }
  }, [lsCdKey]);

  useEffect(() => {
    const stored = localStorage.getItem(lsKey);
    if (stored) {
      try { setOffers(JSON.parse(stored)); return; } catch {}
    }
    const ts = MOCK_OFFERS.map((o) => setTimeout(() => setOffers((p) => {
      const next = p.find(x => x.id === o.id) ? p : [...p, o];
      localStorage.setItem(lsKey, JSON.stringify(next));
      return next;
    }), o.delay));
    return () => ts.forEach(clearTimeout);
  }, [lsKey]);

  useEffect(() => {
    if (cd === 0) return;
    const t = setInterval(() => setCd((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cd === 0]);

  const p2 = (n) => String(n).padStart(2, "0");
  const h = Math.floor(cd / 3600),
    m = Math.floor((cd % 3600) / 60),
    s = cd % 60;
  const tog = (id) => setSelCmp((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 3 ? [...p, id] : p));
  const cmpList = offers.filter((o) => selCmp.includes(o.id));
  const docsF = (t) =>
    t === "privato"
      ? ["CI valido", "Codice Fiscale", "Ultima busta paga", "Estratto conto 3 mesi", "Patente"]
      : ["Visura camerale", "P.IVA e CF", "Bilancio esercizio", "EC aziendale 3 mesi", "CI legale rapp.", "Statuto"];
  const docsCh = (t) =>
    t === "privato"
      ? ["Dichiarazione redditi", "ISEE aggiornato", "Contratto di lavoro"]
      : ["Bilancio ultimi 2 anni", "Visura aggiornata", "EC aziendale 6 mesi", "Delibera CDA"];

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6F9", fontFamily: "'Trebuchet MS',sans-serif" }}>
      <Header onBack={onBack} title="Le mie richieste" />

      <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <p style={{ color: "#FF8C70", fontSize: 9, fontWeight: 700, margin: "0 0 1px 0", letterSpacing: "1px" }}>PRATICA {pratica?.codice}</p>
            <p style={{ color: "#fff", fontSize: 15, fontWeight: 900, margin: "0 0 2px 0" }}>
              {car.brand} {car.model} {car.trim}
            </p>
            {pratica?.cars?.length > 1 && <p style={{ color: "#94A3B8", fontSize: 10, margin: 0 }}>+{pratica.cars.length - 1} altre auto richieste</p>}
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "#94A3B8", fontSize: 9, margin: "0 0 2px 0" }}>Offerte ricevute</p>
            <p style={{ color: "#FF8C70", fontSize: 24, fontWeight: 900, margin: 0 }}>
              {offers.length}
              <span style={{ color: "#5A6680", fontSize: 12 }}>/3</span>
            </p>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 9, padding: "8px 13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "#94A3B8", fontSize: 9, margin: "0 0 1px 0" }}>Tempo rimanente</p>
            <p style={{ color: "#fff", fontSize: 19, fontWeight: 900, margin: 0, fontVariantNumeric: "tabular-nums" }}>
              {p2(h)}:{p2(m)}:{p2(s)}
            </p>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 28, height: 5, borderRadius: 3, background: i < offers.length ? "#FF5733" : "rgba(255,255,255,0.15)" }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "14px" }}>
        {offers.length === 0 && (
          <div style={{ textAlign: "center", padding: "36px 16px", background: "#fff", borderRadius: 13, border: "1.5px solid #E2E8F0" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", margin: "0 0 4px 0" }}>I dealer stanno preparando le offerte</p>
            <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>Riceverai email/SMS non appena arrivano</p>
          </div>
        )}

        {offers.length > 0 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#1A1A2E", margin: 0 }}>
                {offers.length} offerta{offers.length > 1 ? "e" : ""} ricevuta{offers.length > 1 ? "e" : ""}
              </p>
              {offers.length > 1 && (
                <button
                  onClick={() => {
                    setSelCmp(offers.map((o) => o.id));
                    setShowCmp(true);
                  }}
                  style={S.btnSm(true)}
                >
                  📊 Confronta
                </button>
              )}
            </div>

            {offers.map((o, i) => {
              const t = TC[o.tipo] || { bg: "#F8FAFC", br: "#E2E8F0", c: "#374151" };
              const sel = selCmp.includes(o.id);
              return (
                <div key={o.id} style={{ background: "#fff", borderRadius: 12, border: `1.5px solid ${sel ? "#FF5733" : "#E2E8F0"}`, marginBottom: 9, overflow: "hidden" }}>
                  <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", padding: "9px 13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ color: "#94A3B8", fontSize: 8, margin: "0 0 1px 0" }}>DEALER ANONIMO</p>
                      <p style={{ color: "#fff", fontSize: 13, fontWeight: 800, margin: 0 }}>Offerta #{i + 1}</p>
                    </div>
                    <span style={{ background: t.bg, border: `1px solid ${t.br}`, borderRadius: 20, padding: "2px 8px", fontSize: 9, fontWeight: 700, color: t.c }}>
                      {o.tipo}
                    </span>
                  </div>
                  <div style={{ padding: "10px 13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 7 }}>
                      <div>
                        <p style={{ fontSize: 8, color: "#B0BEC5", margin: "0 0 1px 0" }}>Canone mensile</p>
                        <p style={{ fontSize: 26, fontWeight: 900, background: "linear-gradient(135deg,#FF5733,#FF8C00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
                          €{o.canone}
                          <span style={{ fontSize: 10, color: "#B0BEC5", WebkitTextFillColor: "#B0BEC5", background: "none" }}>/mese</span>
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 8, color: "#B0BEC5", margin: "0 0 1px 0" }}>Anticipo</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E", margin: 0 }}>{o.anticipo === 0 ? "€0 (zero)" : "€" + o.anticipo}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
                      {[`📅 ${o.durata}m`, `🛣 ${o.km / 1000}k km`, `${FI[o.carburante] || ""} ${o.carburante}`].map((tag) => (
                        <span key={tag} style={{ background: "#F4F6F9", borderRadius: 5, padding: "2px 6px", fontSize: 9, color: "#6B7A8D" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    {(o.allestimento || o.colore || o.manutenzione || o.assic) && (
                      <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "8px 10px", marginBottom: 8, border: "1px solid #EEF2F6" }}>
                        <p style={{ fontSize: 8, fontWeight: 700, color: "#94A3B8", margin: "0 0 6px 0", letterSpacing: "0.5px" }}>CARATTERISTICHE OFFERTA</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 10, color: "#374151" }}>
                          {o.allestimento && (
                            <div>
                              <span style={{ color: "#8896A6" }}>Allestimento</span> · {o.allestimento}
                            </div>
                          )}
                          {o.colore && (
                            <div>
                              <span style={{ color: "#8896A6" }}>Colore / livrea</span> · {o.colore}
                            </div>
                          )}
                          {o.manutenzione && (
                            <div>
                              <span style={{ color: "#8896A6" }}>Manutenzione</span> · {o.manutenzione}
                            </div>
                          )}
                          {o.assic && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {o.assic.kasko && <span style={{ background: "#EFF6FF", borderRadius: 4, padding: "2px 6px", fontSize: 9, color: "#1E40AF", fontWeight: 600 }}>Kasko fr. €{o.assic.franchigia}</span>}
                              {o.assic.rca && <span style={{ background: "#F0FDF4", borderRadius: 4, padding: "2px 6px", fontSize: 9, color: "#065F46", fontWeight: 600 }}>RCA inclusa</span>}
                              {o.assic.assist && <span style={{ background: "#F0FDF4", borderRadius: 4, padding: "2px 6px", fontSize: 9, color: "#065F46", fontWeight: 600 }}>Assist. {o.assic.assist}</span>}
                              {o.assic.pneumatici && <span style={{ background: "#FFF7ED", borderRadius: 4, padding: "2px 6px", fontSize: 9, color: "#92400E", fontWeight: 600 }}>Cambio gomme</span>}
                              {o.assic.autoSost && <span style={{ background: "#FFF7ED", borderRadius: 4, padding: "2px 6px", fontSize: 9, color: "#92400E", fontWeight: 600 }}>Auto sostitutiva</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {o.note && (
                      <p style={{ background: "#F8FAFC", borderRadius: 6, padding: "6px 9px", fontSize: 10, color: "#374151", fontStyle: "italic", margin: "0 0 8px 0" }}>
                        "{o.note}"
                      </p>
                    )}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => tog(o.id)}
                        style={{
                          flex: 1,
                          background: sel ? "#1A1A2E" : "#F4F6F9",
                          color: sel ? "#fff" : "#374151",
                          border: `1.5px solid ${sel ? "#1A1A2E" : "#E2E8F0"}`,
                          borderRadius: 7,
                          padding: "7px",
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {sel ? "✓ Selezionata" : "Seleziona"}
                      </button>
                      <button
                        onClick={() => {
                          setSelOff(o);
                          setShowF(true);
                        }}
                        disabled={cd === 0}
                        style={{
                          flex: 1,
                          background: cd === 0 ? "#E2E8F0" : "linear-gradient(135deg,#FF5733,#FF8C00)",
                          border: "none",
                          borderRadius: 7,
                          padding: "7px",
                          color: cd === 0 ? "#94A3B8" : "#fff",
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: cd === 0 ? "not-allowed" : "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {cd === 0 ? "Scaduta" : "Scegli →"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {selCmp.length >= 2 && !showCmp && (
              <button onClick={() => setShowCmp(true)} style={{ ...S.btn(true), marginTop: 4, fontSize: 12, padding: "10px" }}>
                📊 Confronta {selCmp.length} offerte selezionate
              </button>
            )}
          </>
        )}
      </div>

      {showCmp && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "#fff", overflowY: "auto", fontFamily: "'Trebuchet MS',sans-serif" }}>
          <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
            <p style={{ color: "#fff", fontSize: 15, fontWeight: 900, margin: 0 }}>📊 Confronto Offerte</p>
            <button
              onClick={() => setShowCmp(false)}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 7, padding: "6px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              ✕ Chiudi
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 320 }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  <td style={{ padding: "12px 16px", color: "#64748B", fontWeight: 700, fontSize: 11, width: 120, borderBottom: "2px solid #E2E8F0" }}>CAMPO</td>
                  {cmpList.map((o) => (
                    <td key={o.id} style={{ padding: "12px 16px", textAlign: "center", fontWeight: 800, color: "#1A1A2E", borderLeft: "1px solid #E2E8F0", borderBottom: "2px solid #E2E8F0" }}>
                      <div style={{ fontSize: 14 }}>Offerta #{offers.indexOf(o) + 1}</div>
                      <div style={{ fontSize: 10, color: TC[o.tipo]?.c || "#64748B", marginTop: 2 }}>{o.tipo}</div>
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Canone/mese", (o) => `€${o.canone}/mese`, true],
                  ["Anticipo", (o) => (o.anticipo === 0 ? "€0 (zero)" : "€" + o.anticipo), false],
                  ["Durata", (o) => `${o.durata} mesi`, false],
                  ["Km annui", (o) => `${o.km / 1000}k km`, false],
                  ["Carburante", (o) => o.carburante, false],
                  ["Allestimento", (o) => o.allestimento || "—", false],
                  ["Colore / livrea", (o) => o.colore || "—", false],
                  ["Manutenzione", (o) => o.manutenzione || "—", false],
                  ["Kasko / franchigia", (o) => (o.assic?.kasko ? `Sì (€${o.assic.franchigia})` : "—"), false],
                  ["RCA", (o) => (o.assic?.rca ? "Inclusa" : "—"), false],
                  ["Assistenza", (o) => o.assic?.assist || "—", false],
                  ["Cambio gomme", (o) => (o.assic?.pneumatici ? "Incluso" : "—"), false],
                  ["Auto sostitutiva", (o) => (o.assic?.autoSost ? "Inclusa" : "—"), false],
                  ["Note", (o) => o.note || "—", false],
                ].map(([label, fn, hl], ri) => (
                  <tr key={label} style={{ background: ri % 2 === 0 ? "#fff" : "#FAFBFC" }}>
                    <td style={{ padding: "12px 16px", color: "#374151", fontWeight: 600, fontSize: 11, borderBottom: "1px solid #F0F3F6" }}>{label}</td>
                    {cmpList.map((o) => {
                      const best = hl && label === "Canone/mese" && cmpList.every((x) => o.canone <= x.canone);
                      return (
                        <td
                          key={o.id}
                          style={{
                            padding: "12px 16px",
                            textAlign: "center",
                            borderLeft: "1px solid #E2E8F0",
                            borderBottom: "1px solid #F0F3F6",
                            background: best ? "#F0FDF4" : "transparent",
                            color: best ? "#16A34A" : "#1A1A2E",
                            fontWeight: hl ? 900 : 400,
                            fontSize: hl ? 16 : 13,
                          }}
                        >
                          {fn(o)}
                          {best && <div style={{ fontSize: 9, color: "#16A34A", fontWeight: 700, marginTop: 2 }}>✓ Migliore</div>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr style={{ background: "#F8FAFC" }}>
                  <td style={{ padding: "12px 16px" }}></td>
                  {cmpList.map((o) => (
                    <td key={o.id} style={{ padding: "12px 16px", textAlign: "center", borderLeft: "1px solid #E2E8F0" }}>
                      <button
                        onClick={() => {
                          setSelOff(o);
                          setShowCmp(false);
                          setShowF(true);
                        }}
                        style={{ ...S.btnSm(true), width: "100%" }}
                      >
                        Scegli →
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showF && selOff && (
        <Modal
          onClose={() => {
            setShowF(false);
            setFStep(1);
          }}
          wide
        >
          <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", padding: "15px 20px" }}>
            <p style={{ color: "#FF8C70", fontSize: 9, fontWeight: 700, margin: "0 0 2px 0" }}>{fStep === 1 ? "STEP 1 — DATI ANAGRAFICI" : "STEP 2 — DOCUMENTI RICHIESTI"}</p>
            <p style={{ color: "#fff", fontSize: 15, fontWeight: 900, margin: 0 }}>{fStep === 1 ? "Completa i tuoi dati" : "Documenti da inviare"}</p>
            <div style={{ display: "flex", gap: 5, marginTop: 8 }}>{[1, 2].map((s) => <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= fStep ? "#FF5733" : "rgba(255,255,255,0.2)" }} />)}</div>
          </div>
          <div style={{ padding: "16px 20px", overflowY: "auto", maxHeight: "68vh" }}>
            {fStep === 1 && (
              <>
                <div style={{ background: "#FFF7ED", border: "1.5px solid #FED7AA", borderRadius: 8, padding: "9px 12px", marginBottom: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#92400E", margin: "0 0 2px 0" }}>Offerta #{offers.indexOf(selOff) + 1} selezionata — {selOff.tipo}</p>
                  <p style={{ fontSize: 11, color: "#B45309", margin: "0 0 6px 0" }}>€{selOff.canone}/mese · Anticipo €{selOff.anticipo} · {selOff.durata}m · {selOff.km / 1000}k km</p>
                  {(selOff.allestimento || selOff.colore || selOff.manutenzione || selOff.assic) && (
                    <p style={{ fontSize: 10, color: "#78350F", margin: 0, lineHeight: 1.5 }}>
                      {selOff.allestimento && <span>{selOff.allestimento} · </span>}
                      {selOff.colore && <span>{selOff.colore} · </span>}
                      {selOff.manutenzione && <span>{selOff.manutenzione} · </span>}
                      {selOff.assic && (
                        <span>
                          Kasko {selOff.assic.kasko ? `fr.€${selOff.assic.franchigia}` : "—"}
                          {selOff.assic.pneumatici ? " · Gomme" : ""}
                          {selOff.assic.autoSost ? " · Auto sost." : ""}
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#B0BEC5", letterSpacing: "1px", margin: "0 0 10px 0" }}>DATI ANAGRAFICI — richiesti dal dealer per l'offerta formale</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 9 }}>
                  {[["nome", "Nome"], ["cognome", "Cognome"]].map(([k, l]) => (
                    <div key={k}>
                      <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 3 }}>{l}</label>
                      <input value={form[k] || ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} style={S.inp} onFocus={S.fo} onBlur={S.bl} />
                    </div>
                  ))}
                </div>
                {userType === "privato" ? (
                  <div style={{ marginBottom: 9 }}>
                    <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 3 }}>Codice Fiscale</label>
                    <input value={form.cf || ""} onChange={(e) => setForm({ ...form, cf: e.target.value })} placeholder="RSSMRA80A01H501U" style={S.inp} onFocus={S.fo} onBlur={S.bl} />
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 9 }}>
                      <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 3 }}>Ragione Sociale</label>
                      <input value={form.ragSoc || ""} onChange={(e) => setForm({ ...form, ragSoc: e.target.value })} style={S.inp} onFocus={S.fo} onBlur={S.bl} />
                    </div>
                    <div style={{ marginBottom: 9 }}>
                      <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 3 }}>Partita IVA</label>
                      <input value={form.piva || ""} onChange={(e) => setForm({ ...form, piva: e.target.value })} style={S.inp} onFocus={S.fo} onBlur={S.bl} />
                    </div>
                  </>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 3 }}>Email</label>
                    <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} style={S.inp} onFocus={S.fo} onBlur={S.bl} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 3 }}>Telefono</label>
                    <input value={form.telefono || ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} style={S.inp} onFocus={S.fo} onBlur={S.bl} />
                  </div>
                </div>
                <button onClick={() => setFStep(2)} style={S.btn(!!(form.nome && form.cognome))}>
                  Continua →
                </button>
              </>
            )}
            {fStep === 2 && (
              <>
                <div style={{ background: "#F0FDF4", border: "1.5px solid #A7F3D0", borderRadius: 8, padding: "9px 12px", marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#065F46", margin: "0 0 2px 0" }}>✅ Dati inviati al dealer</p>
                  <p style={{ fontSize: 10, color: "#047857", margin: 0 }}>Riceverai l'offerta formale via email entro 24 ore</p>
                </div>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#B0BEC5", letterSpacing: "1px", margin: "0 0 8px 0" }}>📎 DOCUMENTI PER FORMALIZZARE — {userType === "privato" ? "PRIVATI" : "AZIENDE"}</p>
                {docsF(userType).map((d, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 7, padding: "8px 10px", marginBottom: 5 }}>
                    <div style={{ width: 18, height: 18, background: "linear-gradient(135deg,#FF5733,#FF8C00)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: 11, color: "#374151" }}>{d}</span>
                  </div>
                ))}
                <p style={{ fontSize: 9, fontWeight: 700, color: "#B0BEC5", letterSpacing: "1px", margin: "12px 0 8px 0" }}>📁 DOCUMENTI PER CHIUSURA CONTRATTO</p>
                {docsCh(userType).map((d, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", background: "#FFF7F5", border: "1.5px solid #FFD5CB", borderRadius: 7, padding: "8px 10px", marginBottom: 5 }}>
                    <div style={{ width: 18, height: 18, background: "#FF5733", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: 11, color: "#374151" }}>{d}</span>
                  </div>
                ))}
                <div style={{ background: "#1A1A2E", borderRadius: 8, padding: "10px 12px", margin: "12px 0" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#FF8C70", margin: "0 0 2px 0" }}>📧 Invia i documenti a:</p>
                  <p style={{ fontSize: 12, color: "#fff", fontWeight: 700, margin: "0 0 2px 0" }}>preventivi@dealer-{offers.indexOf(selOff) + 1}.it</p>
                  <p style={{ fontSize: 9, color: "#5A6680", margin: 0 }}>
                    Oggetto: "Broom — {car.brand} {car.model} — {form.cognome || "Cognome"} — {pratica?.codice}"
                  </p>
                </div>
                <button
                  onClick={() => {
                    const email = `preventivi@dealer-${offers.indexOf(selOff) + 1}.it`;
                    navigator.clipboard?.writeText(email).then(() => {
                      setCopiedEmail(true);
                      setTimeout(() => setCopiedEmail(false), 2500);
                    });
                  }}
                  style={{ ...S.btnSm(true), width: "100%", marginBottom: 8 }}
                >
                  {copiedEmail ? "✓ Email copiata!" : "📋 Copia email dealer"}
                </button>
                <button
                  onClick={() => {
                    setShowF(false);
                    setFStep(1);
                  }}
                  style={{ width: "100%", background: "#F4F6F9", border: "1.5px solid #E2E8F0", borderRadius: 9, padding: "11px", color: "#374151", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Ho capito ✓
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
