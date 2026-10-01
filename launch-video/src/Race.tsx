import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { useVideoConfig } from "remotion";
import { FlightShot } from "./FlightShot";

export const Race = () => {
  const { fps } = useVideoConfig();
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence
        name="Follow the signal"
        durationInFrames={156}
        premountFor={fps}
      >
        <FlightShot
          clip="departure"
          title="FOLLOW THE SIGNAL."
          stage="01 / TIDAL CONDUIT"
          accent="#b5fff0"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 6 })}
      />
      <TransitionSeries.Sequence
        name="Nitro"
        durationInFrames={120}
        premountFor={fps}
      >
        <FlightShot
          clip="nitro"
          title="SPEED HAS A COST."
          stage="01 / TIDAL CONDUIT"
          accent="#eafd85"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence
        name="Rotor"
        durationInFrames={120}
        premountFor={fps}
      >
        <FlightShot
          clip="rotor"
          title="THREAD THE GAP."
          stage="03 / ENGINE ROOM"
          accent="#b5fff0"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence
        name="Prism Archive"
        durationInFrames={120}
        premountFor={fps}
      >
        <FlightShot
          clip="prism"
          title="PRISM ARCHIVE."
          stage="02 / PRISM ARCHIVE"
          accent="#d6c2ff"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence
        name="Solar Relay"
        durationInFrames={120}
        premountFor={fps}
      >
        <FlightShot
          clip="solar"
          title="SOLAR RELAY."
          stage="03 / SOLAR RELAY"
          accent="#ffc97c"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence
        name="Receiver"
        durationInFrames={90}
        premountFor={fps}
      >
        <FlightShot
          clip="arrival"
          title="ONE LAST REPLY."
          stage="04 / RECEIVER"
          accent="#b5fff0"
        />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
