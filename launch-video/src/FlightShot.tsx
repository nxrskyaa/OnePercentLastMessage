import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import clips from "../public/footage/clips.json";
import { cream, easeOut, ink, mint } from "./theme";

export type ShotProps = {
  clip: "departure" | "nitro" | "rotor" | "prism" | "solar" | "arrival";
  title: string;
  stage: string;
  accent: string;
};

export const FlightShot = ({ clip, title, stage, accent }: ShotProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = clips[clip];
  const sample = rows[Math.min(rows.length - 1, Math.max(0, frame))];
  return (
    <AbsoluteFill
      style={{ color: cream, fontFamily: "Arial, sans-serif", background: ink }}
    >
      <Video
        name="Game renderer recording"
        src={staticFile(`footage/${clip}.mp4`)}
        muted
        premountFor={fps}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
      <div
        style={{
          position: "absolute",
          left: 42,
          top: 37,
          padding: "15px 20px",
          background: "#102637dc",
          borderLeft: `3px solid ${accent}`,
        }}
      >
        <div
          style={{
            font: "700 11px Consolas, monospace",
            letterSpacing: 2,
            marginBottom: 3,
          }}
        >
          BATTERY
        </div>
        <div
          style={{
            fontSize: 38,
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 1.05,
          }}
        >
          {sample.battery.toFixed(2)}%
        </div>
        <div
          style={{
            marginTop: 9,
            color: mint,
            font: "700 12px Consolas, monospace",
          }}
        >
          PRIVACY {Math.round(sample.privacy)}%
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 44,
          top: 38,
          background: "#102637cf",
          padding: "11px 18px",
          font: "700 12px Consolas, monospace",
          letterSpacing: 2,
          borderBottom: `2px solid ${accent}`,
        }}
      >
        {stage}
      </div>
      <div
        style={{
          position: "absolute",
          left: 55,
          bottom: 50,
          background: cream,
          color: ink,
          padding: "14px 23px",
          fontSize: 34,
          fontWeight: 900,
          fontStyle: "italic",
          letterSpacing: -1,
          rotate: "-2deg",
          opacity: interpolate(frame, [6, 13, 65, 76], [0, 1, 1, 0], easeOut),
          translate: interpolate(
            frame,
            [4, 17],
            ["-75px 0px", "0px 0px"],
            easeOut,
          ),
          borderBottom: `5px solid ${accent}`,
        }}
      >
        {title}
      </div>
      {sample.boosting && (
        <div
          style={{
            position: "absolute",
            right: 50,
            bottom: 50,
            padding: "12px 19px",
            background: accent,
            color: ink,
            font: "900 italic 24px Arial, sans-serif",
          }}
        >
          NITRO ↗
        </div>
      )}
    </AbsoluteFill>
  );
};
