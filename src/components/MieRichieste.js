import { useState } from "react";
import { S, Header } from "./BaseComponents";
import Monitor from "./Monitor";

export default function MieRichieste({ pratiche, onBack, onOpen }) {
  const [email, setEmail] = useState("");
  const [codice, setCodice] = useState("");
  const [err, setErr] = useState("");
  const [found, setFound] = useState(null);

  const cerca = () => {
    const p = pratiche.find((p) => p.email === email && p.codice === codice);
    if (p) {
      setFound(p);
      setErr("");
    } else setErr("Nessuna pratica trovata con questi dati. Controlla email e codice.");
  };

  if (found) return <Monitor pratica={found} userType={found.userType} onBack={() => setFound(null)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6F9", fontFamily: "'Trebuchet MS',sans-serif" }}>
      <Header onBack={onBack} title="Le mie richieste" />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
        {pratiche.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#1A1A2E", margin: "0 0 10px 0" }}>Richieste in questa sessione</p>
            {pratiche.map((p) => (
              <div
                key={p.codice}
                onClick={() => onOpen(p)}
                style={{ background: "#fff", borderRadius: 11, border: "1.5px solid #EAEEF3", padding: "13px 15px", marginBottom: 9, cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#FF5733")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#EAEEF3")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#FF5733", margin: "0 0 2px 0" }}>{p.codice}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E", margin: "0 0 2px 0" }}>{p.cars.map((c) => `${c.brand} ${c.model}`).join(", ")}</p>
                    <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>
                      {p.cars.length} auto · {p.km / 1000}k km · {p.durata} mesi · max €{p.budget}/mese
                    </p>
                  </div>
                  <span style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: "#92400E", flexShrink: 0 }}>
                    In attesa
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 13, border: "1.5px solid #EAEEF3", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#1A1A2E", margin: "0 0 4px 0" }}>Accedi a una pratica</p>
          <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 16px 0" }}>Inserisci l'email usata nella richiesta e il codice pratica ricevuto via email/SMS.</p>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mario@rossi.it" style={S.inp} onFocus={S.fo} onBlur={S.bl} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 4 }}>Codice pratica</label>
            <input
              value={codice}
              onChange={(e) => setCodice(e.target.value.toUpperCase())}
              placeholder="BRO-XXXX"
              style={{ ...S.inp, letterSpacing: 2, fontWeight: 700 }}
              onFocus={S.fo}
              onBlur={S.bl}
            />
          </div>
          {err && <p style={{ fontSize: 11, color: "#DC2626", margin: "0 0 12px 0" }}>{err}</p>}
          <button onClick={cerca} disabled={!email || !codice} style={S.btn(!!(email && codice))}>
            Accedi alla pratica →
          </button>
        </div>
      </div>
    </div>
  );
}
