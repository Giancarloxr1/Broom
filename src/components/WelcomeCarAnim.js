import { useState, useEffect, useRef } from "react";

export default function WelcomeCarAnim() {
  const [car, setCar] = useState({
    leftPct: -16,
    yPx: 0,
    rot: 0,
    flip: false,
    filter: "none",
  });
  const [bits, setBits] = useState([]);
  const nextBitId = useRef(0);
  const timersRef = useRef([]);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const T_IDLE = 0.48;
    const T_LAUNCH = 0.78;
    const T_CRUISE_END = 5.85;
    const T_U_END = 7.35;
    const lerp = (a, b, u) => a + (b - a) * u;
    const smooth = (u) => u * u * (3 - 2 * u);
    let lastBit = 0;

    const loop = (now) => {
      const t = (now - start) / 1000;
      let leftPct;
      let yPx;
      let rot;
      let flip;
      let filter;

      if (t < T_IDLE) {
        const shake = Math.sin(t * 86) * 3.2 + Math.sin(t * 29) * 2.1;
        leftPct = -16;
        yPx = 0;
        rot = shake;
        flip = false;
        filter = Math.abs(shake) > 2.2 ? "drop-shadow(0 2px 10px rgba(255,100,60,0.45))" : "none";
      } else if (t < T_LAUNCH) {
        const p = smooth((t - T_IDLE) / (T_LAUNCH - T_IDLE));
        const rumble = Math.sin(now * 0.095) * (1 - p) * 5.5;
        leftPct = lerp(-16, -3, p) + (p < 0.42 ? Math.sin(now * 0.152) * 5 : 0);
        yPx = -4 * p;
        rot = rumble - 14 * Math.sin(p * Math.PI);
        flip = false;
        filter = "drop-shadow(0 4px 16px rgba(255,85,45,0.55))";
      } else if (t < T_CRUISE_END) {
        const p = smooth((t - T_LAUNCH) / (T_CRUISE_END - T_LAUNCH));
        leftPct = lerp(-3, 87, p);
        yPx = -Math.sin(p * Math.PI) * 28;
        rot = -16 * Math.sin(p * Math.PI);
        flip = false;
        filter = "drop-shadow(0 2px 8px rgba(0,0,0,0.2))";
      } else if (t < T_U_END) {
        const p = smooth((t - T_CRUISE_END) / (T_U_END - T_CRUISE_END));
        leftPct = lerp(87, 80, p) + Math.sin(p * Math.PI) * 9;
        yPx = Math.sin(p * Math.PI) * 20;
        rot = Math.sin(p * Math.PI) * 11 * (1 - p * 0.85);
        flip = p > 0.42;
        filter = "none";
      } else {
        const wt = t - T_U_END;
        const sway = Math.sin(wt * 2.55) * 2.8;
        const swayX = Math.cos(wt * 2.55) * 1.85;
        leftPct = 80 + swayX * 0.12;
        yPx = sway * 0.55;
        rot = sway;
        flip = true;
        filter = "none";
      }

      setCar({ leftPct, yPx, rot, flip, filter });

      if (t > T_LAUNCH && t < T_U_END - 0.12 && now - lastBit > 36) {
        lastBit = now;
        const id = ++nextBitId.current;
        const isSmoke = t < T_CRUISE_END + 0.35 && Math.random() > 0.5;
        setBits((prev) => [...prev, { id, x: leftPct, y: yPx + (isSmoke ? -8 : 3), sm: isSmoke }].slice(-55));
        const tid = window.setTimeout(() => {
          setBits((prev) => prev.filter((b) => b.id !== id));
        }, isSmoke ? 1450 : 1050);
        timersRef.current.push(tid);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);
  return (
    <div style={{ height: 124, margin: "6px auto 10px", position: "relative", maxWidth: 560, width: "100%", overflow: "visible", zIndex: 2 }}>
      {bits.map((b) =>
        b.sm ? (
          <div
            key={b.id}
            className="welcome-smoke-bit"
            style={{
              position: "absolute",
              left: `${b.x}%`,
              bottom: 10,
              width: 26,
              height: 26,
              marginLeft: (b.id % 5) * 2 - 4,
              borderRadius: "50%",
              background: "radial-gradient(circle at 40% 40%, rgba(200,210,225,0.55) 0%, rgba(120,130,150,0.22) 45%, transparent 72%)",
              filter: "blur(5px)",
              transform: `translate(-50%, ${b.y}px)`,
              pointerEvents: "none",
              mixBlendMode: "screen",
            }}
          />
        ) : (
          <div
            key={b.id}
            className="welcome-trail-bit"
            style={{
              position: "absolute",
              left: `${b.x}%`,
              bottom: 8,
              width: 18,
              height: 5,
              borderRadius: 99,
              background: "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.45))",
              boxShadow: "0 0 12px rgba(255,255,255,0.75), 0 0 4px rgba(255,255,255,0.9)",
              transform: `translate(-50%, ${b.y}px) rotate(-8deg)`,
              pointerEvents: "none",
            }}
          />
        )
      )}
      {car.filter.includes("255,85,45") && (
        <div
          style={{
            position: "absolute",
            left: `calc(${car.leftPct}% - 18px)`,
            bottom: 4,
            width: 56,
            height: 14,
            transform: `translate(-50%, ${car.yPx}px)`,
            background: "radial-gradient(ellipse at center, rgba(255,75,40,0.5) 0%, rgba(40,40,45,0.35) 45%, transparent 75%)",
            pointerEvents: "none",
            filter: "blur(2px)",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: `${car.leftPct}%`,
          bottom: 6,
          fontSize: 104,
          lineHeight: 1,
          transform: `translate(-50%, ${car.yPx}px) rotate(${car.rot}deg) scaleX(${car.flip ? 1 : -1})`,
          transformOrigin: "50% 70%",
          filter: car.filter,
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        🚗
      </div>
    </div>
  );
}
