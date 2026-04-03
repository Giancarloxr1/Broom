import { useState, useEffect } from "react";
import { S } from "./BaseComponents";

export default function SendAnim({ cars, onDone }) {
  const [phase, setPhase] = useState(0);
  const [cx, setCx] = useState(0);
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const d = setInterval(() => setDots((n) => (n + 1) % 4), 500);
    const c = setInterval(() => setCx((x) => (x + 2) % 110), 28);
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 2400);
    const t3 = setTimeout(() => setPhase(3), 3600);
    return () => {
      clearInterval(d);
      clearInterval(c);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);
  const dp = ".".repeat(dots);
  return (
    <div style={{ padding: "8px 0 4px" }}>
      <div style={{ background: "linear-gradient(155deg,#1A1A2E,#0F3460)", borderRadius: 14, padding: "20px 16px", marginBottom: 12 }}>
        <div style={{ background: "#374151", height: 14, borderRadius: 3, position: "relative", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 2,
              background:
                "repeating-linear-gradient(90deg,#F59E0B 0,#F59E0B 14px,transparent 14px,transparent 28px)",
              transform: "translateY(-50%)",
            }}
          />
        </div>
        <div style={{ position: "relative", height: 40, marginTop: -6 }}>
          <div style={{ position: "absolute", left: `${cx}%`, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 15, lineHeight: 1 }}>🧑</div>
            <div style={{ fontSize: 22, lineHeight: 1 }}>🚗</div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          {phase === 0 && (
            <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, margin: 0 }}>
              Invio richiesta{dp}
            </p>
          )}
          {phase === 1 && (
            <div>
              <div style={{ fontSize: 24, marginBottom: 3 }}>✉️</div>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, margin: 0 }}>Richiesta ai 3 dealer{dp}</p>
            </div>
          )}
          {phase === 2 && (
            <div>
              <div style={{ fontSize: 24, marginBottom: 3 }}>📨</div>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, margin: 0 }}>Dealer notificati{dp}</p>
            </div>
          )}
          {phase === 3 && (
            <div>
              <div style={{ fontSize: 24, marginBottom: 3 }}>✅</div>
              <p style={{ color: "#10B981", fontSize: 13, fontWeight: 800, margin: 0 }}>Richiesta inviata!</p>
            </div>
          )}
          {cars.length > 1 && <p style={{ color: "#5A6680", fontSize: 10, margin: "4px 0 0 0" }}>{cars.length} auto richieste · 3 dealer per auto</p>}
        </div>
      </div>
      {phase === 3 && (
        <div style={{ background: "#F0FDF4", border: "1.5px solid #A7F3D0", borderRadius: 10, padding: "14px" , marginBottom: 10}}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#065F46", margin: "0 0 6px 0" }}>📋 Il tuo codice pratica</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: "#1A1A2E", margin: "0 0 4px 0", letterSpacing: 2 }}>
            {cars[0]?.codice || "BRO-XXXX"}
          </p>
          <p style={{ fontSize: 11, color: "#047857", margin: 0 }}>Controlla email e SMS — riceverai il link per seguire le offerte in tempo reale.</p>
        </div>
      )}
      {phase === 3 && <button onClick={onDone} style={{ ...S.btn(true), fontSize: 13, padding: "11px" }}>Vai alle mie richieste →</button>}
    </div>
  );
}
