import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import Mpris from "gi://AstalMpris";

import Actions from "./Actions";
import Progress from "./Progress";
import Info from "./Info";

export default (player: Mpris.Player) => {
  const { VERTICAL } = Gtk.Orientation;

  const Main = (
    <box orientation={VERTICAL}>
      {Actions(player)}
      {Progress(player)}
      {Info(player)}
    </box>
  ) as Gtk.Widget;

  const Lyrics = (
    <scrolledwindow class="lyrics">
      <label
        label={createBinding(player, "lyrics").as((l) => (l || "No lyrics"))}
        justify={Gtk.Justification.LEFT}
        vexpand
        hexpand
        wrap
      />
    </scrolledwindow>
  ) as Gtk.Widget;

  const MediaStack = (
    <stack
      $={(self) => {
        self.add_titled(Main, "main", "");
        self.add_titled(Lyrics, "lyrics", "");
      }}
      transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
      hhomogeneous
      vhomogeneous
    />
  ) as Gtk.Stack;

  return (
    <box orientation={VERTICAL}>
      {MediaStack}
      <Gtk.StackSwitcher stack={MediaStack} class="no-labels" />
    </box>
  );
};
