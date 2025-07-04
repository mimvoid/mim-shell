import { pointer } from "@lib/utils";
import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import Mpris from "gi://AstalMpris";

// Song progress

function lengthStr(length: number) {
  const min = Math.trunc(length / 60);
  const sec = (Math.trunc(length) - min * 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

export default (player: Mpris.Player) => {
  const { START, END } = Gtk.Align;

  const length = createBinding(player, "length");
  const position = createBinding(player, "position");

  const ProgressBar = (
    <slider
      $={pointer}
      value={position((p) => (p > 0 ? p / player.length : 0))}
      onChangeValue={({ value }) =>
        void (player.position = value * player.length)
      }
      hexpand
    />
  );

  const Position = (
    <label class="position" label={position(lengthStr)} halign={START} />
  );

  const Length = (
    <label
      class="length"
      label={length((l) => (l > 0 ? lengthStr(l) : "0:00"))}
      halign={END}
    />
  );

  return (
    <box class="media-progress" visible={length((l) => l > 0)}>
      {Position}
      {ProgressBar}
      {Length}
    </box>
  );
};
