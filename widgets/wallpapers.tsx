import { Astal, App, Gtk, Gdk } from "astal/gtk4";
import Gio from "gi://Gio";

import { pointer, setLayerrules } from "@lib/utils";
import { ScrolledWindow, Picture } from "@lib/astalified";
import Wallpapers from "@services/wallpapers";

export default () => {
  const { EXTERNAL, NEVER } = Gtk.PolicyType;
  const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

  const wallpapers = Wallpapers.get_default();

  const Choices = wallpapers.wallpapers.map(([fileName, thumbnail]) => (
    <button
      setup={pointer}
      cssClasses={["item"]}
      onClicked={() => wallpapers.setWallpaper(Wallpapers.directory + fileName)}
    >
      <box vertical spacing={8}>
        <overlay>
          <box heightRequest={120} widthRequest={240} />
          <Picture
            type="overlay clip measure"
            file={Gio.File.new_for_path(
              !!thumbnail ? thumbnail : Wallpapers.directory + fileName,
            )}
          />
        </overlay>
        <label cssClasses={["filename"]} label={fileName} />
      </box>
    </button>
  ));

  return (
    <window
      setup={(self) => {
        setLayerrules(self.namespace, ["blur", "ignorezero", "xray 0"]);
        self.child.widthRequest = App.get_monitors()[0].geometry.width;
      }}
      name="wallpaperPicker"
      namespace="wallpaper-picker"
      cssClasses={["wallpaper-picker", "popover"]}
      anchor={BOTTOM | LEFT | RIGHT}
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.NORMAL}
      keymode={Astal.Keymode.EXCLUSIVE}
      onKeyPressed={({ name }, keyval) => {
        if (keyval === Gdk.KEY_Escape) App.toggle_window(name);
      }}
      application={App}
      marginBottom={12}
    >
      <ScrolledWindow hscrollbarPolicy={EXTERNAL} vscrollbarPolicy={NEVER}>
        <box spacing={8}>{Choices}</box>
      </ScrolledWindow>
    </window>
  ) as Gtk.Window;
};
