import { useState, useEffect } from "react";
import { S, Header } from "./BaseComponents";
import { CARS, BRANDS, genCodice } from "../data/cars";
import CarCard from "./CarCard";
import { CarFilters, IvaToggle } from "./CarFilters";
import SendFormModal from "./SendFormModal";
import BasketPanel from "./BasketPanel";

export default function ClientMain({ userType, onBack, pratiche, onNuovaPratica, onMieRichieste }) {
  const [tab, setTab] = useState("offerte");
  const [brand, setBrand] = useState("Tutti");
  const [model, setModel] = useState("Tutti");
  const [cat, setCat] = useState("Tutti");
  const [fuel, setFuel] = useState("Tutti");
  const [disp, setDisp] = useState("Tutte");
  const [budget, setBudget] = useState(900);
  const [ivaInclC, setIvaInclC] = useState(false);
  const [basket, setBasket] = useState(() => {
    try { return JSON.parse(localStorage.getItem("broom_basket") || "[]"); } catch { return []; }
  });
  const [showPanel, setShowPanel] = useState(false);
  const [fuoriL, setFuoriL] = useState({ brand: "", model: "", note: "" });
  const [showSend, setShowSend] = useState(false);
  const [sendData, setSendData] = useState(null);
  const [bPrev, setBPrev] = useState(400);
  const [km, setKm] = useState(20000);
  const [dur, setDur] = useState(36);
  const [selCarPrev, setSelCarPrev] = useState(null);
  const [contatto, setContatto] = useState({ email: "", telefono: "", canale: "email" });

  useEffect(() => {
    try { localStorage.setItem("broom_basket", JSON.stringify(basket)); } catch {}
  }, [basket]);

  const modelList = brand === "Tutti" ? [] : ["Tutti", ...[...new Set(CARS.filter((c) => c.brand === brand).map((c) => c.model))].sort()];
  const cars = CARS.filter(
    (c) =>
      (brand === "Tutti" || c.brand === brand) &&
      (model === "Tutti" || c.model === model) &&
      (cat === "Tutti" || c.cat === cat) &&
      (fuel === "Tutti" || c.carburante === fuel) &&
      (disp === "Tutte" || (disp === "⚡ Pronta consegna" ? c.pronta : !c.pronta)) &&
      c.canone <= budget
  );
  const inBasket = (c) => !!basket.find((x) => x.id === c.id);
  const togBasket = (c) => setBasket((p) => (inBasket(c) ? p.filter((x) => x.id !== c.id) : [...p, c]));
  const addFuori = () => {
    if (!fuoriL.brand || !fuoriL.model) return;
    const custom = { id: `c_${Date.now()}`, brand: fuoriL.brand, model: fuoriL.model, trim: "", version: fuoriL.note, cat: "", emoji: "🚗", canone: 0, anticipo: 0, durata: dur, km, carburante: "", pronta: false, consegna: "", risparmio: 0, colore: "", assic: {} };
    setBasket((p) => [...p, custom]);
    setFuoriL({ brand: "", model: "", note: "" });
  };
  const inviaRichiesta = () => {
    const codice = genCodice();
    const p = {
      codice,
      email: contatto.email,
      telefono: contatto.telefono,
      canale: contatto.canale,
      userType,
      cars: basket.length > 0 ? basket.map((c) => ({ ...c, codice })) : [{ ...selCarPrev, codice }],
      km,
      durata: dur,
      budget: bPrev,
      data: new Date().toLocaleDateString("it-IT"),
    };
    setSendData(p);
  };

  const filtersProps = { brand, setBrand, model, setModel, modelList, cat, setCat, fuel, setFuel, budget, setBudget, disp, setDisp };

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6F9", fontFamily: "'Trebuchet MS',sans-serif", paddingBottom: tab === "offerte" ? 80 : 0 }}>
      <Header
        onBack={onBack}
        title=""
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {pratiche.length > 0 && (
              <button onClick={onMieRichieste} style={{ background: "#F4F6F9", border: "1px solid #E2E8F0", borderRadius: 7, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>
                📋 {pratiche.length}
              </button>
            )}
          </div>
        }
      />

      <div style={{ background: "linear-gradient(155deg,#1A1A2E 0%,#0F3460 100%)", padding: "20px 16px 18px" }}>
        <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
          <h1 style={{ color: "#fff", fontSize: "clamp(18px,5vw,26px)", fontWeight: 900, margin: "0 0 8px", lineHeight: 1.1 }}>
            Noleggio lungo termine.<br />
            <span style={{ background: "linear-gradient(135deg,#FF5733,#FF8C00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Finalmente semplice.</span>
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 12, margin: 0, lineHeight: 1.65 }}>
            <span style={{ color: "#FFAB90", fontWeight: 700 }}>Prezzi reali</span>
            <span style={{ opacity: 0.35, margin: "0 0.5em" }}>·</span>
            Risposta rapida
            <span style={{ opacity: 0.35, margin: "0 0.5em" }}>·</span>
            40+ modelli
          </p>
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "1px solid #EAEEF3", position: "sticky", top: 56, zIndex: 90 }}>
        <div style={{ display: "flex", overflowX: "auto", maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
          {[{ id: "offerte", l: "🚗 Offerte", s: `${cars.length} auto` }, { id: "preventivo", l: "📋 Preventivo", s: "Su misura" }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", borderBottom: tab === t.id ? "2.5px solid #FF5733" : "2.5px solid transparent", padding: "10px 18px", cursor: "pointer", whiteSpace: "nowrap", textAlign: "left", flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: tab === t.id ? "#1A1A2E" : "#8896A6", fontFamily: "inherit" }}>{t.l}</div>
              <div style={{ fontSize: 10, color: "#B0BEC5" }}>{t.s}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 16px" }}>
        {tab === "offerte" && (
          <>
            <CarFilters {...filtersProps} />
            <IvaToggle ivaInclC={ivaInclC} setIvaInclC={setIvaInclC} />
            <p style={{ fontSize: 12, color: "#8896A6", margin: "0 0 10px 0" }}>
              <strong style={{ color: "#1A1A2E" }}>{cars.length}</strong> auto trovate{basket.length > 0 ? ` · ${basket.length} selezionate` : ""}
            </p>
            {cars.length === 0 && (
              <div style={{ textAlign: "center", padding: "36px 16px", background: "#fff", borderRadius: 13, border: "1.5px solid #E2E8F0" }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>🔍</div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E", margin: "0 0 4px 0" }}>Nessuna auto trovata</p>
                <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>Allarga il budget o cambia i filtri</p>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,288px),1fr))", gap: 12 }}>
              {cars.map((car) => <CarCard key={car.id} car={car} inBasket={inBasket(car)} onToggle={togBasket} ivaInclC={ivaInclC} showBtn={true} />)}
            </div>
          </>
        )}

        {tab === "preventivo" && (
          !selCarPrev ? (
            <div>
              <div style={{ background: "#fff", borderRadius: 11, border: "1.5px solid #EAEEF3", padding: "12px 14px", marginBottom: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#1A1A2E", margin: "0 0 4px 0" }}>1️⃣ Seleziona l'auto e clicca "Richiedi preventivo"</p>
                <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>Oppure usa la selezione multipla nel tab Offerte per più modelli insieme.</p>
              </div>
              <CarFilters {...filtersProps} />
              <IvaToggle ivaInclC={ivaInclC} setIvaInclC={setIvaInclC} />
              <p style={{ fontSize: 12, color: "#8896A6", margin: "0 0 10px 0" }}>
                <strong style={{ color: "#1A1A2E" }}>{cars.length}</strong> auto trovate
              </p>
              {cars.length === 0 && (
                <div style={{ textAlign: "center", padding: "30px 16px", background: "#fff", borderRadius: 13, border: "1.5px solid #E2E8F0" }}>
                  <div style={{ fontSize: 28, marginBottom: 7 }}>🔍</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E", margin: "0 0 4px 0" }}>Nessuna auto trovata</p>
                  <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>Allarga il budget o cambia i filtri</p>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,288px),1fr))", gap: 12 }}>
                {cars.map((car) => <CarCard key={car.id} car={car} inBasket={false} onToggle={() => {}} ivaInclC={ivaInclC} showBtn={false} onSelectPrev={setSelCarPrev} />)}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 540, margin: "0 auto" }}>
              <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", borderRadius: 12, padding: "12px 15px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 26 }}>{selCarPrev.emoji}</span>
                  <div>
                    <p style={{ color: "#FF8C70", fontSize: 9, fontWeight: 700, margin: "0 0 1px 0" }}>AUTO SELEZIONATA</p>
                    <p style={{ color: "#fff", fontSize: 14, fontWeight: 900, margin: "0 0 1px 0" }}>{selCarPrev.brand} {selCarPrev.model} {selCarPrev.trim}</p>
                    <p style={{ color: "#5A6680", fontSize: 10, margin: 0 }}>da €{selCarPrev.canone}/mese</p>
                  </div>
                </div>
                <button onClick={() => setSelCarPrev(null)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 7, padding: "5px 10px", color: "#fff", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                  Cambia
                </button>
              </div>
              <div style={{ background: "#fff", borderRadius: 13, border: "1.5px solid #EAEEF3", padding: "18px", marginBottom: 14 }}>
                <div style={{ marginBottom: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <label style={{ fontSize: 11, color: "#6B7A8D" }}>Budget mensile</label>
                    <span style={{ fontWeight: 800, color: "#FF5733" }}>€{bPrev}/mese</span>
                  </div>
                  <input type="range" min={150} max={950} value={bPrev} onChange={(e) => setBPrev(Number(e.target.value))} style={{ width: "100%", accentColor: "#FF5733" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                  <div>
                    <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 4 }}>Km annui</label>
                    <select value={km} onChange={(e) => setKm(Number(e.target.value))} style={{ ...S.inp, cursor: "pointer" }}>
                      {[[10000, "10k"], [15000, "15k"], [20000, "20k"], [30000, "30k"], [40000, "40k"]].map(([v, l]) => (
                        <option key={v} value={v}>{l} km</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 4 }}>Durata</label>
                    <select value={dur} onChange={(e) => setDur(Number(e.target.value))} style={{ ...S.inp, cursor: "pointer" }}>
                      {[[24, "24 mesi"], [36, "36 mesi"], [48, "48 mesi"], [60, "60 mesi"]].map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowSend(true)} style={S.btn(true)}>Richiedi preventivo →</button>
            </div>
          )
        )}
      </div>

      {tab === "offerte" && (
        <BasketPanel
          basket={basket}
          setBasket={setBasket}
          showPanel={showPanel}
          setShowPanel={setShowPanel}
          fuoriL={fuoriL}
          setFuoriL={setFuoriL}
          onAddFuori={addFuori}
          onInvia={() => setShowSend(true)}
        />
      )}

      {showSend && (
        <SendFormModal
          onClose={() => setShowSend(false)}
          sendData={sendData}
          contatto={contatto}
          setContatto={setContatto}
          onInvia={inviaRichiesta}
          basket={basket}
          selCarPrev={selCarPrev}
          onDone={() => {
            setShowSend(false);
            setSendData(null);
            onNuovaPratica(sendData);
            setBasket([]);
            setShowPanel(false);
          }}
        />
      )}
    </div>
  );
}
