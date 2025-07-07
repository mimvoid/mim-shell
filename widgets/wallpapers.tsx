import app from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import Gio from "gi://Gio";

import { pointer, setLayerrules } from "@lib/utils";
import Wallpapers from "@services/wallpapers";

export default () => {
  const { EXTERNAL, NEVER } = Gtk.PolicyType;
  const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

  const wallpapers = Wallpapers.get_default();

  const Choices = wallpapers.wallpapers.map(([fileName, thumbnail]) => {
    let Pic: Gtk.Picture;
    return (
      <button
        $={pointer}
        class="item"
        onClicked={() =>
          wallpapers.setWallpaper(Wallpapers.directory + fileName)
        }
      >
        <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
          <overlay $={(self) => {
            self.set_measure_overlay(Pic, true)
            self.set_clip_overlay(Pic, true);
          }}>
            <box heightRequest={120} widthRequest={240} />
            <Gtk.Picture
              $={(self) => (Pic = self)}
              $type="overlay"
              file={Gio.File.new_for_path(
                thumbnail || Wallpapers.directory + fileName,
              )}
            />
          </overlay>
          <label class="filename" label={fileName} />
        </box>
      </button>
    );
  });

  return (
    <window
      $={(self) => {
        setLayerrules(self.namespace, ["blur", "ignorezero", "xray 0"]);
        self.child.widthRequest = app.get_monitors()[0].geometry.width;
      }}
      name="wallpaperPicker"
      namespace="wallpaper-picker"
      class="wallpaper-picker popover transparent"
      visible
      anchor={BOTTOM | LEFT | RIGHT}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.EXCLUSIVE}
      marginBottom={12}
      application={app}
    >
      <Gtk.EventControllerKey
        onKeyPressed={({ widget }, keyval) => {
          if (keyval === Gdk.KEY_Escape) app.toggle_window(widget.name);
        }}
      />
      <scrolledwindow hscrollbarPolicy={EXTERNAL} vscrollbarPolicy={NEVER}>
        <box spacing={8}>{Choices}</box>
      </scrolledwindow>
    </window>
  ) as Gtk.Window;
};
