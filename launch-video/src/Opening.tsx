import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { cream, easeOut, ink, mint } from "./theme";

export const Opening = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{ background: ink, color: ink, fontFamily: "Arial, sans-serif" }}
    >
      <Video
        src={staticFile("footage/opening.mp4")}
        muted
        premountFor={fps}
        style={{ width: "100%", height: "100%" }}
      />
      <AbsoluteFill
        style={{ background: "linear-gradient(90deg,#10263788,transparent)" }}
      />
      <div
        style={{
          position: "absolute",
          left: -70,
          top: -100,
          width: 830,
          height: 950,
          background: cream,
          rotate: "-8deg",
          translate: interpolate(frame, [65, 89], ["0px 0px", "-1100px 0px"], {
            ...easeOut,
            easing: Easing.bezier(0.7, 0, 0.2, 1),
          }),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 52,
          width: 565,
          translate: interpolate(
            frame,
            [65, 89],
            ["0px 0px", "-1000px 0px"],
            easeOut,
          ),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 3,
          }}
        >
          <CanvasImage
            src={staticFile("brand/dlicom-mark-reference.jpg")}
            premountFor={fps}
            style={{
              width: 38,
              height: 38,
              objectFit: "cover",
              borderRadius: 20,
            }}
          />{" "}
          DLICOM × NXR
        </div>
        <div
          style={{
            marginTop: 38,
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 86,
              height: 43,
              border: `3px solid ${ink}`,
              position: "relative",
              padding: 4,
            }}
          >
            <div style={{ width: 6, height: 27, background: ink }} />
            <div
              style={{
                position: "absolute",
                right: -9,
                top: 10,
                width: 6,
                height: 20,
                background: ink,
              }}
            />
          </div>
          <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: 2 }}>
            BATTERY CRITICAL
          </span>
        </div>
        <CanvasImage
          src={staticFile("brand/last-message-logo.svg")}
          premountFor={fps}
          style={{
            width: 535,
            height: 208,
            marginTop: 30,
            translate: interpolate(frame, [0, 19], ["-65px 30px", "0px 0px"], {
              ...easeOut,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            opacity: interpolate(frame, [0, 10], [0, 1], easeOut),
          }}
        />
        <div
          style={{
            marginTop: 35,
            fontSize: 42,
            lineHeight: 1.07,
            fontWeight: 900,
            letterSpacing: -1,
          }}
        >
          ONE PERCENT.
          <br />
          ONE MESSAGE LEFT.
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 14,
            letterSpacing: 4,
            fontFamily: "Consolas, monospace",
          }}
        >
          TRANSMISSION 001 / DILI ONLINE
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 108,
          width: 395,
          padding: "25px 26px",
          background: ink,
          color: cream,
          borderLeft: `4px solid ${mint}`,
          rotate: "3deg",
          opacity: interpolate(frame, [15, 23, 62, 75], [0, 1, 1, 0], easeOut),
          translate: interpolate(frame, [15, 31], ["60px 0px", "0px 0px"], {
            ...easeOut,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <div
          style={{
            font: "14px Consolas, monospace",
            color: mint,
            letterSpacing: 2,
          }}
        >
          INCOMING / MOM
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, marginTop: 12 }}>
          “where are you?”
        </div>
        <div style={{ fontSize: 15, marginTop: 20, color: mint }}>
          ONE REPLY QUEUED →
        </div>
      </div>
      <svg
        width="1280"
        height="720"
        style={{
          position: "absolute",
          pointerEvents: "none",
          opacity: interpolate(frame, [40, 50, 70, 84], [0, 1, 1, 0], easeOut),
        }}
      >
        <path
          d="M1040 320 C1040 470 750 290 650 520"
          fill="none"
          stroke={mint}
          strokeWidth="3"
          strokeDasharray="520"
          strokeDashoffset={interpolate(frame, [42, 68], [520, 0], easeOut)}
        />
        <circle
          cx="650"
          cy="520"
          r={interpolate(frame, [57, 75], [4, 19], easeOut)}
          fill="none"
          stroke={mint}
          strokeWidth="3"
        />
      </svg>
    </AbsoluteFill>
  );
};
