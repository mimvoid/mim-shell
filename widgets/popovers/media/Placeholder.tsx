import { Gtk } from "ags/gtk4";

export default () => {
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
    <box class="with-cover-art" orientation={Gtk.Orientation.VERTICAL}>
      {CoverArt}
      {Title}
    </box>
  );
};
