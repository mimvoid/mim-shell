import { Accessor } from "ags";
import { Gtk } from "ags/gtk4";
import Mpris from "gi://AstalMpris";

export default (players: Accessor<Mpris.Player[]>) => {
  const CoverArt = (
    <box class="cover-art-box cover-art-container placeholder" />
  );

  const Title = (
    <label
      class="title"
      label="Nothing Playing"
      justify={Gtk.Justification.CENTER}
    />
  );

  return (
    <box
      class="with-cover-art"
      visible={players((ps) => !ps[0])}
      orientation={Gtk.Orientation.VERTICAL}
    >
      {CoverArt}
      {Title}
    </box>
  );
};
