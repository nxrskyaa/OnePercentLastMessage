import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Series,
  staticFile,
  useVideoConfig,
  interpolate,
} from "remotion";
import { Opening } from "./Opening";
import { Race } from "./Race";
import { Closing } from "./Closing";
import { easeOut } from "./theme";

export const Launch = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence
          name="One message queued"
          durationInFrames={90}
          premountFor={fps}
        >
          <Opening />
        </Series.Sequence>
        <Series.Sequence
          name="Gameplay"
          durationInFrames={720}
          premountFor={fps}
        >
          <Race />
        </Series.Sequence>
        <Series.Sequence
          name="Your turn"
          durationInFrames={183}
          premountFor={fps}
        >
          <Closing />
        </Series.Sequence>
      </Series>
      <Audio
        name="Afterglow Dispatch"
        src={staticFile("afterglow-dispatch-v1.mp3")}
        trimBefore={497}
        durationInFrames={993}
        premountFor={fps}
        volume={(f) =>
          interpolate(f, [0, 25, 900, 992], [0, 0.8, 0.8, 0], easeOut)
        }
      />
      <Audio
        name="Incoming message"
        src={staticFile("sfx/notify.wav")}
        from={17}
        premountFor={fps}
        volume={0.75}
      />
      <Audio
        name="Launch cut"
        src={staticFile("sfx/air-cut.wav")}
        from={76}
        premountFor={fps}
        volume={0.65}
      />
      <Audio
        name="Nitro engine"
        src={staticFile("sfx/nitro.wav")}
        from={281}
        premountFor={fps}
        volume={0.55}
      />
      <Audio
        name="Rotor transition"
        src={staticFile("sfx/air-cut.wav")}
        from={350}
        premountFor={fps}
        volume={0.45}
      />
      <Audio
        name="Prism transition"
        src={staticFile("sfx/scan.wav")}
        from={480}
        premountFor={fps}
        volume={0.65}
      />
      <Audio
        name="Solar transition"
        src={staticFile("sfx/air-cut.wav")}
        from={590}
        premountFor={fps}
        volume={0.45}
      />
      <Audio
        name="Receiver connection"
        src={staticFile("sfx/relay.wav")}
        from={799}
        premountFor={fps}
        volume={0.7}
      />
      <Audio
        name="Delivered"
        src={staticFile("sfx/delivered.wav")}
        from={812}
        premountFor={fps}
        volume={0.9}
      />
    </AbsoluteFill>
  );
};
