import { createBinding, createComputed } from "ags";
import { Gtk } from "ags/gtk4";
import Mpris from "gi://AstalMpris";
import { pointer } from "@lib/utils";

// Song progress

function lengthStr(length: number) {
  const min = Math.trunc(length / 60);
  const sec = (Math.trunc(length) - min * 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

export default (player: Mpris.Player) => {
  const { START, END } = Gtk.Align;

  const position = createBinding(player, "position");
  const length = createBinding(player, "length");
  const progress = createComputed([position, length], (pos, len) =>
    len > 0 ? pos / len : 0,
  );

  const ProgressBar = (
    <slider
      $={pointer}
      value={progress}
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
