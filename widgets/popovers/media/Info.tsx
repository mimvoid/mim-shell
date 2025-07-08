import { createBinding, createState } from "ags";
import { Gtk } from "ags/gtk4";
import Mpris from "gi://AstalMpris";

import Gio from "gi://Gio";
import Pango from "gi://Pango";

import Visualizer from "./Visualizer";
import Icon from "@lib/icons";
import { pointer } from "@lib/utils";

// Information about the current song
export default (player: Mpris.Player) => {
  const { START, END, FILL } = Gtk.Align;
  const [CavaWidget, setCavaWidget] = createState<Gtk.Widget | null>(null);

  const VisToggle = (overlay: Gtk.Overlay) =>
    (
      <button
        $={pointer}
        $type="overlay"
        onClicked={() => {
          const CurrentCava = CavaWidget.get();
          if (CurrentCava) {
            CurrentCava.visible = !CurrentCava.visible;
            return;
          }

          // Lazy load Cava visualizer
          const newCava = Visualizer();
          setCavaWidget(newCava);
          overlay.add_overlay(newCava);
        }}
        class="cava-toggler"
        iconName={Icon.visualizer}
        halign={END}
        valign={START}
      />
    ) as Gtk.Widget;

  // Display cover art
  const coverArt = createBinding(player, "coverArt");
  const Art = (
    <Gtk.Picture
      $={(self) => {
        function getArt() {
          const art = coverArt.get();
          self.visible = !!art;
          if (art) self.file = Gio.File.new_for_path(art);
        }
        getArt();
        coverArt.subscribe(getArt);
      }}
      $type="overlay"
      class="cover-art"
      contentFit={Gtk.ContentFit.COVER}
      valign={FILL}
    />
  );

  const CoverArt = (
    <overlay
      $={(self) => self.add_overlay(VisToggle(self))}
      class="cover-art-container"
    >
      <box class="cover-art-box" />
      {Art}
    </overlay>
  );

  const Title = (
    <label
      class="title"
      label={createBinding(player, "title")}
      justify={Gtk.Justification.CENTER}
      maxWidthChars={36}
      lines={2}
      ellipsize={Pango.EllipsizeMode.END}
      wrap
    />
  );

  const Artist = (
    <label
      class="media-artist"
      label={createBinding(player, "artist").as((a) => a || "")}
      justify={Gtk.Justification.CENTER}
      wrap
    />
  );

  return (
    <box class="with-cover-art" orientation={Gtk.Orientation.VERTICAL}>
      {CoverArt}
      {Title}
      {Artist}
    </box>
  );
};
