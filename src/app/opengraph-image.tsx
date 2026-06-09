import { ImageResponse } from "next/og";

export const alt = "ES Viry-Châtillon Football";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #001c10 0%, #00351f 55%, #07542f 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", height: 8, width: 160, background: "#f7c600", borderRadius: 999 }} />
        <div
          style={{
            marginTop: 32,
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 1.02,
            textTransform: "uppercase",
            letterSpacing: -2
          }}
        >
          ES Viry-Châtillon
        </div>
        <div style={{ fontSize: 88, fontWeight: 900, color: "#f7c600", textTransform: "uppercase", letterSpacing: -2 }}>
          Football
        </div>
        <div style={{ marginTop: 36, fontSize: 36, color: "rgba(255,255,255,0.85)" }}>
          Une passion, notre force — Jaune et Vert depuis 1958
        </div>
      </div>
    ),
    { ...size }
  );
}
