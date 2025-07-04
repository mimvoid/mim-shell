import { With, createBinding } from "ags";
import Mpris from "gi://AstalMpris";

import MediaStack from "./Stack";
import Placeholder from "./Placeholder";
import PopRevealer from "@lib/widgets/PopRevealer";

// Pass the mpris player to the widget modules
export default () => {
  const mpris = Mpris.get_default();
  const Ph = Placeholder();
  const players = createBinding(mpris, "players");

  return (
    <PopRevealer name="media" class="media box" hasArrow={false}>
      <With value={players}>
        {(ps: Mpris.Player[]) => (ps[0] ? MediaStack(ps[0]) : Ph)}
      </With>
    </PopRevealer>
  );
};
