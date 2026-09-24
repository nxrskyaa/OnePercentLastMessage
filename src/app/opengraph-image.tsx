import { ImageResponse } from "next/og";

export const alt = "1% — Last Message. One battery percent. One message left.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#030a13",
        color: "#e8fbfc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {[520, 400, 280, 160].map((diameter) => (
        <div
          key={diameter}
          style={{
            position: "absolute",
            width: diameter,
            height: diameter,
            border: "2px solid #24556b",
            borderRadius: "50%",
            top: (630 - diameter) / 2,
            right: (590 - diameter) / 2,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          top: 309,
          right: 273,
          width: 45,
          height: 45,
          background: "#b9fbff",
          transform: "rotate(45deg)",
          boxShadow: "0 0 65px #6ae5ed",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 68,
          top: 54,
          fontSize: 18,
          letterSpacing: 5,
          color: "#8bb6c2",
        }}
      >
        NXR // SIGNAL DIVISION
      </div>
      <div
        style={{
          position: "absolute",
          left: 68,
          top: 164,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 195,
            fontWeight: 800,
            letterSpacing: -18,
            lineHeight: 1,
          }}
        >
          1<span style={{ color: "#a0f2f5", fontSize: 99 }}>%</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 55,
            fontWeight: 700,
            letterSpacing: 3,
            marginTop: 15,
          }}
        >
          LAST MESSAGE
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 25,
            color: "#a3c0c9",
            marginTop: 34,
          }}
        >
          One battery percent. One message left.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          display: "flex",
          left: 68,
          bottom: 48,
          fontSize: 15,
          letterSpacing: 3,
          color: "#78a4b0",
        }}
      >
        A NETWORK SURVIVAL GAME // DLICOM AI GAME JAM
      </div>
    </div>,
    size,
  );
}
