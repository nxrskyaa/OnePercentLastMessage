import { Composition, Folder } from "remotion";
import { Launch } from "./Launch";
import { Opening } from "./Opening";
import { Race } from "./Race";
import { Closing } from "./Closing";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LastMessageLaunch"
        component={Launch}
        durationInFrames={993}
        fps={30}
        width={1280}
        height={720}
      />
      <Folder name="Scenes">
        <Composition
          id="Opening"
          component={Opening}
          durationInFrames={90}
          fps={30}
          width={1280}
          height={720}
        />
        <Composition
          id="Gameplay"
          component={Race}
          durationInFrames={720}
          fps={30}
          width={1280}
          height={720}
        />
        <Composition
          id="Closing"
          component={Closing}
          durationInFrames={183}
          fps={30}
          width={1280}
          height={720}
        />
      </Folder>
    </>
  );
};
