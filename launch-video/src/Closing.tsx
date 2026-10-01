import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  CanvasImage,
  Freeze,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import clips from "../public/footage/clips.json";
import { cream, easeOut, ink, mint } from "./theme";

export const Closing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{ background: ink, color: cream, fontFamily: "Arial, sans-serif" }}
    >
      <Freeze frame={89}>
        <Video
          src={staticFile("footage/arrival.mp4")}
          muted
          premountFor={fps}
          style={{ width: "100%", height: "100%" }}
        />
      </Freeze>
      <AbsoluteFill
        style={{
          background: "#102637e8",
          opacity: interpolate(frame, [0, 14], [0, 1], easeOut),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 63,
          top: 54,
          width: 775,
          opacity: interpolate(frame, [6, 18], [0, 1], easeOut),
          translate: interpolate(
            frame,
            [6, 20],
            ["0px 25px", "0px 0px"],
            easeOut,
          ),
        }}
      >
        <div
          style={{
            font: "700 17px Consolas, monospace",
            letterSpacing: 3,
            color: mint,
          }}
        >
          ✓ MESSAGE DELIVERED
        </div>
        <CanvasImage
          src={staticFile("brand/last-message-logo.svg")}
          premountFor={fps}
          style={{ width: 575, height: 223, marginTop: 29 }}
        />
        <div style={{ marginTop: 24, display: "flex", gap: 35 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 2, color: mint }}>
              SCORE
            </div>
            <b style={{ fontSize: 34 }}>
              {clips.result.score.toLocaleString("en-US")}
            </b>
          </div>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 2, color: mint }}>
              PRIVACY
            </div>
            <b style={{ fontSize: 34 }}>{clips.result.privacy}%</b>
          </div>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 2, color: mint }}>
              BATTERY
            </div>
            <b style={{ fontSize: 34 }}>{clips.result.battery.toFixed(2)}%</b>
          </div>
        </div>
        <div
          style={{
            marginTop: 37,
            color: ink,
            background: cream,
            padding: "15px 20px",
            display: "inline-block",
            rotate: "-2deg",
            opacity: interpolate(frame, [38, 48], [0, 1], easeOut),
          }}
        >
          <div style={{ fontSize: 29, fontWeight: 900, fontStyle: "italic" }}>
            YOUR TURN. HIT TRANSMIT ↗
          </div>
          <div style={{ fontSize: 21, marginTop: 8, fontWeight: 700 }}>
            last-message-lac.vercel.app
          </div>
        </div>
        <div
          style={{ marginTop: 34, fontSize: 14, letterSpacing: 3, color: mint }}
        >
          A BROWSER GAME BY NXR / @nxrskyaa
        </div>
      </div>
      <CanvasImage
        src={staticFile("brand/dili-blue-cutout.png")}
        premountFor={fps}
        style={{
          position: "absolute",
          width: 420,
          height: 565,
          objectFit: "contain",
          right: 27,
          bottom: 60,
          translate: interpolate(
            frame,
            [8, 28],
            ["160px 65px", "0px 0px"],
            easeOut,
          ),
          rotate: interpolate(frame, [8, 34], ["12deg", "-3deg"], easeOut),
          opacity: interpolate(frame, [8, 20], [0, 1], easeOut),
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 67,
          bottom: 34,
          font: "700 13px Consolas, monospace",
          color: mint,
          letterSpacing: 2,
        }}
      >
        DLICOM AI GAME JAM
      </div>
    </AbsoluteFill>
  );
};
