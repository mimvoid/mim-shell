import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import GLib from "gi://GLib?version=2.0";

import { name } from "@lib/variables";
import PopRevealer from "@lib/widgets/PopRevealer";
import Trash from "@services/trash";

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

function TrashInfo() {
  const trash = Trash.get_default();
  return (
    <box class="trash-info section">
      <image iconName={createBinding(trash, "iconName")} />
      <label
        class="trash-disk-usage"
        label={createBinding(trash, "diskUsage").as((du) =>
          GLib.format_size(du),
        )}
      />
    </box>
  );
}

export default () => (
  <PopRevealer name="dashboard" class="dashboard" hasArrow={false}>
    <box orientation={VERTICAL}>
      <User />
      <Toggles />
      <Launchers />
      <TrashInfo />
    </box>
  </PopRevealer>
);
