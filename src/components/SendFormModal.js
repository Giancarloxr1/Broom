import { S, Modal } from "./BaseComponents";
import SendAnim from "./SendAnim";

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function SendFormModal({ onClose, sendData, contatto, setContatto, onInvia, onDone, basket, selCarPrev }) {
  const carsToSend = basket.length > 0 ? basket : [selCarPrev].filter(Boolean);
  const canSend = isValidEmail(contatto.email) && contatto.telefono.trim().length >= 6;

  return (
    <Modal onClose={onClose} wide>
      {!sendData ? (
        <>
          <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", padding: "15px 20px" }}>
            <p style={{ color: "#FF8C70", fontSize: 9, fontWeight: 700, margin: "0 0 2px 0" }}>INVIA RICHIESTA</p>
            <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 900, margin: 0 }}>Come ti contattano i dealer?</h3>
          </div>
          <div style={{ padding: "16px 20px", overflowY: "auto", maxHeight: "70vh" }}>
            <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#1A1A2E", margin: "0 0 8px 0" }}>Auto richieste ({carsToSend.length})</p>
              {carsToSend.map((c) => (
                <p key={c.id} style={{ fontSize: 11, color: "#374151", margin: "0 0 3px 0" }}>
                  • {c.brand} {c.model} {c.trim}{c.version ? " — " + c.version : ""}
                </p>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "#64748B", margin: "0 0 14px 0" }}>
              Le tue offerte arriveranno via email o SMS con il codice pratica per seguirle su broom. I tuoi dati non vengono trasmessi ai dealer in questa fase.
            </p>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 4 }}>Email *</label>
              <input type="email" value={contatto.email} onChange={(e) => setContatto({ ...contatto, email: e.target.value })} placeholder="mario@rossi.it" style={S.inp} onFocus={S.fo} onBlur={S.bl} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 4 }}>Telefono *</label>
              <input value={contatto.telefono} onChange={(e) => setContatto({ ...contatto, telefono: e.target.value })} placeholder="+39 333 123456" style={S.inp} onFocus={S.fo} onBlur={S.bl} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, color: "#8896A6", display: "block", marginBottom: 7 }}>Ricevi il codice pratica tramite:</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[["email", "📧 Email"], ["sms", "📱 SMS"], ["entrambi", "📧 + 📱 Entrambi"]].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setContatto({ ...contatto, canale: v })}
                    style={{
                      flex: 1,
                      background: contatto.canale === v ? "#1A1A2E" : "#F4F6F9",
                      color: contatto.canale === v ? "#fff" : "#374151",
                      border: `1.5px solid ${contatto.canale === v ? "#1A1A2E" : "#E2E8F0"}`,
                      borderRadius: 8,
                      padding: "9px 4px",
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {contatto.email && !isValidEmail(contatto.email) && (
              <p style={{ fontSize: 10, color: "#DC2626", margin: "0 0 8px 0" }}>Inserisci un'email valida</p>
            )}
            <button onClick={onInvia} disabled={!canSend} style={S.btn(canSend)}>
              Invia richiesta →
            </button>
          </div>
        </>
      ) : (
        <div style={{ padding: "16px 18px" }}>
          <SendAnim cars={sendData.cars} onDone={onDone} />
        </div>
      )}
    </Modal>
  );
}
