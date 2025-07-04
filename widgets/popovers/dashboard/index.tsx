import { Gtk } from "ags/gtk4";

import { name } from "@lib/variables";
import PopRevealer from "@lib/widgets/PopRevealer";

import Toggles from "./toggles";
import Launchers from "./launchers";

const { START, CENTER } = Gtk.Align;
const { VERTICAL } = Gtk.Orientation;

function User() {
  const Avatar = <image class="avatar" file={`${SRC}/assets/avatar.jpg`} />;

  const Names = (
    <box orientation={VERTICAL} valign={CENTER}>
      <label label={name.username} class="title" halign={START} />
      <label label={name.hostname} halign={START} />
    </box>
  );

  return (
    <box class="user-info section">
      {Avatar}
      {Names}
    </box>
  );
}

export default () => (
  <PopRevealer name="dashboard" class="dashboard" hasArrow={false}>
    <box orientation={VERTICAL}>
      <User />
      <Toggles />
      <Launchers />
    </box>
  </PopRevealer>
);
