import { useState } from "react";
import { SlideIn, Dark } from "./components/BaseComponents";
import { S } from "./components/BaseComponents";
import WelcomeScreen from "./components/WelcomeScreen";
import ClientMain from "./components/ClientMain";
import DealerMain from "./components/DealerMain";
import Monitor from "./components/Monitor";
import MieRichieste from "./components/MieRichieste";
import { ALL_BRANDS_D } from "./data/cars";

export default function App() {
  const [sc, setSc] = useState("welcome");
  const [sid, setSid] = useState(0);
  const [uType, setUType] = useState(null);
  const [df, setDf] = useState({ rag: "", piva: "", email: "", tipo: "", brands: [], cats: [] });
  const [pratiche, setPratiche] = useState([]);
  const [attivaPratica, setAttivaPratica] = useState(null);

  const go = (to) => {
    setSid((i) => i + 1);
    setSc(to);
  };
  const W = (ch) => {
    return (
      <div style={{ position: "relative", overflowX: "visible", overflowY: "auto", minHeight: "100vh" }}>
        <SlideIn id={sid}>{ch}</SlideIn>
      </div>
    );
  };

  if (sc === "welcome")
    return W(
      <WelcomeScreen
        pratiche={pratiche}
        onStartClient={() => go("tipo-c")}
        onDealerHow={() => go("dealer-how")}
        onMieRichieste={() => go("mie-richieste")}
      />
    );

  if (sc === "tipo-c")
    return W(
      <Dark step={0} total={3} onBack={() => go("welcome")}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: "0 0 6px" }}>Stai cercando per...</h2>
          <p style={{ color: "#5A6680", fontSize: 12, margin: "0 0 24px" }}>Seleziona il profilo per ricevere le condizioni giuste.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { v: "privato", ic: "👤", t: "Uso privato", d: "Persona fisica", tag: "Privato" },
              { v: "azienda", ic: "🏢", t: "Uso aziendale", d: "Azienda / P.IVA", tag: "Azienda" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => { setUType(o.v); go("benvenuto"); }}
                style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 13, padding: "18px 12px", textAlign: "center", cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,87,51,0.12)"; e.currentTarget.style.borderColor = "rgba(255,87,51,0.35)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
              >
                <div style={{ fontSize: 30, marginBottom: 8 }}>{o.ic}</div>
                <p style={{ color: "#fff", fontSize: 13, fontWeight: 800, margin: "0 0 4px 0" }}>{o.t}</p>
                <p style={{ color: "#5A6680", fontSize: 10, margin: "0 0 9px 0" }}>{o.d}</p>
                <span style={{ background: "rgba(255,87,51,0.15)", border: "1px solid rgba(255,87,51,0.3)", borderRadius: 20, padding: "2px 9px", fontSize: 9, color: "#FF8C70" }}>{o.tag}</span>
                <div style={{ marginTop: 10, background: "linear-gradient(135deg,#FF5733,#FF8C00)", borderRadius: 7, padding: "6px 0", color: "#fff", fontSize: 11, fontWeight: 700 }}>Entra →</div>
              </button>
            ))}
          </div>
        </div>
      </Dark>
    );

  if (sc === "benvenuto")
    return W(
      <Dark step={2} total={3} onBack={() => go("tipo-c")}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 66, height: 66, background: "linear-gradient(135deg,#FF5733,#FF8C00)", borderRadius: "50%", fontSize: 28, marginBottom: 16, boxShadow: "0 8px 24px rgba(255,87,51,0.4)" }}>{uType === "privato" ? "👤" : "🏢"}</div>
          <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>{uType === "privato" ? "Benvenuto!" : "Benvenuto, azienda!"}</h2>
          <p style={{ color: "#CBD5E1", fontSize: 14, lineHeight: 1.65, margin: "0 0 18px", maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
            Confronta le offerte dei migliori dealer. <span style={{ color: "#FFAB90", fontWeight: 700 }}>Prezzi chiari</span>, tempi certi, tutto online.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 14px", marginBottom: 24, maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
            {["Prezzi trasparenti", "Risposta 24h", "Ampia scelta"].map((t, i) => (
              <span key={t} style={{ fontSize: 12, fontWeight: 600, color: "#E2E8F0", borderBottom: "2px solid rgba(255,120,80,0.65)", paddingBottom: 3 }}>
                {["✅", "⚡", "🚗"][i]} {t}
              </span>
            ))}
          </div>
          <button onClick={() => go("client")} style={{ ...S.btn(true), fontSize: 14, padding: "12px 28px" }}>
            🚗 Esplora offerte →
          </button>
        </div>
      </Dark>
    );

  if (sc === "dealer-how")
    return W(
      <Dark step={0} total={4} onBack={() => go("welcome")}>
        <div>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 10, color: "#FF8C70", letterSpacing: "1.5px", fontWeight: 600, margin: "0 0 4px 0" }}>AREA DEALER</p>
            <h2 style={{ color: "#fff", fontSize: 21, fontWeight: 900, margin: 0 }}>Come funziona broom</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
            {[
              ["01", "📝", "Registrati", "Dati aziendali"],
              ["02", "🏷️", "Brand & categorie", "Cosa tratti"],
              ["03", "📩", "Ricevi richieste", "Max 3 per auto"],
              ["04", "✅", "Rispondi", "Offerta non vincolante"],
            ].map(([n, ic, t, d]) => (
              <div key={n} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: "10px 11px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ width: 21, height: 21, background: "linear-gradient(135deg,#FF5733,#FF8C00)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{n}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 1 }}>
                    <span style={{ fontSize: 11 }}>{ic}</span>
                    <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{t}</span>
                  </div>
                  <p style={{ color: "#5A6680", fontSize: 9, margin: 0 }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => go("dealer-reg")} style={S.btn(true)}>Inizia registrazione →</button>
        </div>
      </Dark>
    );

  if (sc === "dealer-reg")
    return W(
      <Dark step={1} total={4} onBack={() => go("dealer-how")}>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 15, padding: "20px 22px" }}>
          <p style={{ fontSize: 10, color: "#FF8C70", letterSpacing: "1.5px", fontWeight: 600, margin: "0 0 4px 0" }}>STEP 1</p>
          <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 900, margin: "0 0 14px 0" }}>Dati aziendali</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            {[
              ["rag", "Ragione Sociale", "Rossi Srl"],
              ["piva", "Partita IVA", "IT012345"],
              ["email", "Email", "info@rossi.it"],
              ["tel", "Telefono", "02 123456"],
            ].map(([k, l, ph]) => (
              <div key={k}>
                <label style={{ fontSize: 9, color: "#CBD5E1", display: "block", marginBottom: 3 }}>{l}</label>
                <input placeholder={ph} value={df[k] || ""} onChange={(e) => setDf({ ...df, [k]: e.target.value })} style={S.inpD} onFocus={S.foD} onBlur={S.blD} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 13 }}>
            <label style={{ fontSize: 9, color: "#CBD5E1", display: "block", marginBottom: 5 }}>Tipo intermediario</label>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {["Broker NLT", "Concessionaria", "Noleggiatore", "Dealer multimarca"].map((t) => (
                <button
                  key={t}
                  onClick={() => setDf({ ...df, tipo: t })}
                  style={{
                    background: df.tipo === t ? "linear-gradient(135deg,#FF5733,#FF8C00)" : "rgba(255,255,255,0.06)",
                    color: "#fff",
                    border: `1.5px solid ${df.tipo === t ? "transparent" : "rgba(255,255,255,0.12)"}`,
                    borderRadius: 7,
                    padding: "4px 10px",
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => go("dealer-brands")} disabled={!df.rag || !df.piva || !df.email} style={S.btn(!!df.rag && !!df.piva && !!df.email)}>
            Continua →
          </button>
        </div>
      </Dark>
    );

  if (sc === "dealer-brands")
    return W(
      <Dark step={2} total={4} onBack={() => go("dealer-reg")}>
        <div>
          <p style={{ fontSize: 10, color: "#FF8C70", letterSpacing: "1.5px", fontWeight: 600, margin: "0 0 4px 0" }}>STEP 2</p>
          <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 900, margin: "0 0 4px 0" }}>Cosa tratti?</h3>
          <p style={{ color: "#5A6680", fontSize: 11, margin: "0 0 14px 0" }}>Riceverai richieste solo per brand e categorie selezionati.</p>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, margin: "0 0 8px 0" }}>BRAND</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {ALL_BRANDS_D.map((b) => {
                const a = df.brands.includes(b);
                return (
                  <button
                    key={b}
                    onClick={() => setDf({ ...df, brands: a ? df.brands.filter((x) => x !== b) : [...df.brands, b] })}
                    style={{
                      background: a ? "linear-gradient(135deg,#FF5733,#FF8C00)" : "rgba(255,255,255,0.06)",
                      color: "#fff",
                      border: `1.5px solid ${a ? "transparent" : "rgba(255,255,255,0.12)"}`,
                      borderRadius: 16,
                      padding: "3px 10px",
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, margin: "0 0 8px 0" }}>CATEGORIE</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                ["Citycar", "🚗"],
                ["Berlina", "🏎️"],
                ["SUV", "🚙"],
                ["Commerciale", "🚚"],
              ].map(([c, ic]) => {
                const a = df.cats.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => setDf({ ...df, cats: a ? df.cats.filter((x) => x !== c) : [...df.cats, c] })}
                    style={{
                      background: a ? "linear-gradient(135deg,#FF5733,#FF8C00)" : "rgba(255,255,255,0.06)",
                      color: "#fff",
                      border: `1.5px solid ${a ? "transparent" : "rgba(255,255,255,0.12)"}`,
                      borderRadius: 16,
                      padding: "4px 13px",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {ic} {c}
                  </button>
                );
              })}
            </div>
          </div>
          {(df.brands.length > 0 || df.cats.length > 0) && (
            <div style={{ background: "rgba(255,87,51,0.1)", border: "1px solid rgba(255,87,51,0.2)", borderRadius: 8, padding: "7px 11px", marginBottom: 11, fontSize: 10, color: "#FF8C70" }}>
              ✓ Richieste per: {[...df.brands, ...df.cats].join(", ")}
            </div>
          )}
          <button onClick={() => go("dealer-ok")} disabled={df.brands.length === 0 && df.cats.length === 0} style={S.btn(df.brands.length > 0 || df.cats.length > 0)}>
            Continua →
          </button>
        </div>
      </Dark>
    );

  if (sc === "dealer-ok")
    return W(
      <Dark step={3} total={4} onBack={() => go("dealer-brands")}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 66, height: 66, background: "linear-gradient(135deg,#FF5733,#FF8C00)", borderRadius: "50%", fontSize: 28, marginBottom: 16, boxShadow: "0 8px 24px rgba(255,87,51,0.4)" }}>
            🏁
          </div>
          <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: "0 0 8px" }}>Sei pronto!</h2>
          <p style={{ color: "#5A6680", fontSize: 13, margin: "0 0 22px", lineHeight: 1.6, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
            Account <strong style={{ color: "#fff" }}>{df.rag || "dealer"}</strong> configurato. Inizia a ricevere richieste qualificate.
          </p>
          <button onClick={() => go("dealer")} style={{ ...S.btn(true), fontSize: 14, padding: "12px 28px" }}>
            🏢 Entra nella dashboard →
          </button>
        </div>
      </Dark>
    );

  if (sc === "mie-richieste")
    return <MieRichieste pratiche={pratiche} onBack={() => go("welcome")} onOpen={(p) => { setAttivaPratica(p); go("monitor"); }} />;
  if (sc === "monitor" && attivaPratica)
    return <Monitor pratica={attivaPratica} userType={uType || "privato"} onBack={() => { setAttivaPratica(null); go("mie-richieste"); }} />;
  if (sc === "client")
    return (
      <ClientMain
        userType={uType}
        onBack={() => go("benvenuto")}
        pratiche={pratiche}
        onNuovaPratica={(p) => { setPratiche((prev) => [...prev, p]); setAttivaPratica(p); go("monitor"); }}
        onMieRichieste={() => go("mie-richieste")}
      />
    );
  if (sc === "dealer") return <DealerMain dealer={df} onBack={() => go("welcome")} />;
  return null;
}
