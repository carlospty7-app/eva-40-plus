import { ImageResponse } from "next/og";

export const alt = "EVA 40+ — Tu ruta metabólica, no otra dieta";
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
          padding: "0 90px",
          background: "linear-gradient(135deg, #1e3a30 0%, #205344 100%)",
          color: "#fffefe",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 6, color: "#e0c178" }}>EVA 40+</div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 80, lineHeight: 1.08, fontWeight: 600 }}>
          Desinflámate esta semana, no otra dieta
        </div>
        <div style={{ display: "flex", marginTop: 32, fontSize: 34, color: "#dfe6e4" }}>
          Tu Score Metabólico y tu ruta de 3 prioridades, hechos para después de los 40.
        </div>
      </div>
    ),
    size,
  );
}
