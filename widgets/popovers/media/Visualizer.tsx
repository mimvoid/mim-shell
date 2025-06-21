import { Gtk, hook, Astal } from "astal/gtk4";
import Cava from "gi://AstalCava";

export default () => {
  const { END, FILL } = Gtk.Align;

  const cava = Cava.get_default()!;
  cava.bars = 12;
  cava.active = true;

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

  return (
    <box
      setup={(self) => {
        hook(self, cava, "notify::values", () => {
          const values = cava.get_values();
          for (let i = 0; i < Bars.length; i++) {
            Bars[i].value = values[i];
          }
        });
        hook(self, self, "map", () => (cava.active = true));
        hook(self, self, "unmap", () => (cava.active = false));
      }}
      cssClasses={["cava"]}
      spacing={2}
      valign={END}
      halign={FILL}
    >
      {Bars}
    </box>
  );
};
