import { ImageResponse } from "next/og";

export const alt = "Micael Martins — Construo software que resolve problemas reais.";
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
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#f2efe8",
          color: "#141413",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, fontFamily: "monospace", letterSpacing: 3, color: "#77746c" }}>
          <span>MICAEL MARTINS</span>
          <span>DESENVOLVEDOR DE SOFTWARE</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 110, lineHeight: 0.92, letterSpacing: -3 }}>
          <span>Construo software</span>
          <span>que resolve</span>
          <span style={{ color: "#b4441f", fontStyle: "italic" }}>problemas reais.</span>
        </div>
        <div style={{ display: "flex", borderTop: "2px solid #141413", paddingTop: 18, fontSize: 24, fontFamily: "sans-serif", color: "#46443f" }}>
          Dashboard de Suporte · Manuais · Cultiva · Viaja+ · Demo Park API
        </div>
      </div>
    ),
    size,
  );
}
