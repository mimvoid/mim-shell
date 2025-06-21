import { bind } from "astal";
import Mpris from "gi://AstalMpris";

import MediaStack from "./media/Stack";
import Placeholder from "./media/Placeholder";
import PopRevealer from "@lib/widgets/PopRevealer";

const mpris = Mpris.get_default();

// Pass the mpris player to the widget modules
export default (
  <PopRevealer name="media" cssClasses={["media", "box"]} hasArrow={false}>
    {bind(mpris, "players").as((ps) => (ps[0] ? MediaStack(ps[0]) : Placeholder()))}
  </PopRevealer>
);
