import { Gtk, Astal } from "ags/gtk4";
import Cava from "gi://AstalCava";

export default () => {
  const { END, FILL } = Gtk.Align;

  const cava = Cava.get_default()!;
  cava.bars = 12;

  const Bars = cava
    .get_values()
    .map(
      (v) =>
        (
          <slider
            value={v}
            inverted
            orientation={Gtk.Orientation.VERTICAL}
            halign={FILL}
            hexpand
          />
        ) as Astal.Slider,
    );

  const len = Bars.length;
  const id = cava.connect("notify::values", (cavaSrc) => {
    const values = cavaSrc.get_values();
    for (let i = 0; i < len; i++) {
      Bars[i].value = values[i];
    }
  });

  return (
    <box
      class="cava"
      spacing={2}
      valign={END}
      halign={FILL}
      onMap={() => (cava.active = true)}
      onUnmap={() => (cava.active = false)}
      onDestroy={() => cava.disconnect(id)}
    >
      {Bars}
    </box>
  ) as Gtk.Widget;
};
