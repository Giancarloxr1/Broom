import { useState, useEffect } from "react";

export const S = {
  inp: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 9,
    border: "1.5px solid #E8EDF2",
    background: "#FAFBFC",
    color: "#1A1A2E",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  inpD: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 9,
    border: "1.5px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.07)",
    color: "#fff",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  btn: (on = true) => ({
    background: on ? "linear-gradient(135deg,#FF5733,#FF8C00)" : "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: 11,
    padding: "13px",
    color: on ? "#fff" : "rgba(255,255,255,0.3)",
    fontSize: 14,
    fontWeight: 800,
    cursor: on ? "pointer" : "default",
    fontFamily: "inherit",
    width: "100%",
    boxShadow: on ? "0 4px 18px rgba(255,87,51,0.28)" : "none",
  }),
  btnSm: (on = true) => ({
    background: on ? "linear-gradient(135deg,#FF5733,#FF8C00)" : "#F4F6F9",
    border: "none",
    borderRadius: 8,
    padding: "9px 16px",
    color: on ? "#fff" : "#8896A6",
    fontSize: 12,
    fontWeight: 700,
    cursor: on ? "pointer" : "default",
    fontFamily: "inherit",
    boxShadow: "none",
  }),
  fo: (e) => {
    e.target.style.borderColor = "#FF5733";
    e.target.style.boxShadow = "0 0 0 3px rgba(255,87,51,0.08)";
  },
  bl: (e) => {
    e.target.style.borderColor = "#E8EDF2";
    e.target.style.boxShadow = "none";
  },
  foD: (e) => (e.target.style.borderColor = "#FF5733"),
  blD: (e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)"),
};

export function Chip({ on, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: on ? "#1A1A2E" : "#F4F6F9",
        color: on ? "#fff" : "#8896A6",
        border: `1.5px solid ${on ? "#1A1A2E" : "#E8EDF2"}`,
        borderRadius: 8,
        padding: "6px 12px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export function Modal({ children, onClose, wide }) {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,15,35,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          maxWidth: wide ? 620 : 460,
          width: "100%",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
          margin: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Dark({ children, step, total, onBack }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(155deg,#1A1A2E 0%,#0F3460 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px 32px",
        fontFamily: "'Trebuchet MS',sans-serif",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 16, left: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 30,
            height: 30,
            background: "linear-gradient(135deg,#FF5733,#FF8C00)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
          }}
        >
          🏎
        </div>
        <span style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>broom</span>
      </div>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: 18,
            left: 60,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 7,
            padding: "5px 12px",
            color: "#fff",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            marginLeft: 16,
          }}
        >
          ← Indietro
        </button>
      )}
      {total && (
        <div style={{ display: "flex", gap: 7, marginBottom: 24, justifyContent: "center" }}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 24 : 7,
                height: 7,
                borderRadius: 4,
                background:
                  i === step
                    ? "#FF5733"
                    : i < step
                      ? "rgba(255,87,51,0.35)"
                      : "rgba(255,255,255,0.12)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      )}
      <div style={{ maxWidth: 500, width: "100%" }}>{children}</div>
    </div>
  );
}

export function SlideIn({ children, id }) {
  const [st, setSt] = useState({ opacity: 0, transform: "translateX(32px)" });
  useEffect(() => {
    const t = requestAnimationFrame(() =>
      setSt({
        opacity: 1,
        transform: "translateX(0)",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      })
    );
    return () => cancelAnimationFrame(t);
  }, [id]);
  return (
    <div style={{ ...st, minHeight: "100vh", width: "100%", position: "relative" }}>
      {children}
    </div>
  );
}

export function Header({ title, onBack, right }) {
  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "1px solid #EAEEF3",
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 10px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: "#F4F6F9",
              border: "none",
              borderRadius: 8,
              padding: "6px 11px",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              marginRight: 4,
            }}
          >
            ←
          </button>
        )}
        <div
          style={{
            width: 27,
            height: 27,
            background: "linear-gradient(135deg,#FF5733,#FF8C00)",
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
          }}
        >
          🏎
        </div>
        <span style={{ fontSize: 17, fontWeight: 900, color: "#1A1A2E" }}>{title || "broom"}</span>
        <span
          style={{
            fontSize: 8,
            fontWeight: 700,
            color: "#FF5733",
            background: "#FFF0EC",
            border: "1px solid #FFD5CB",
            borderRadius: 3,
            padding: "1px 4px",
          }}
        >
          BETA
        </span>
      </div>
      {right}
    </header>
  );
}
