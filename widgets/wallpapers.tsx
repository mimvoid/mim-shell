import { getScope } from "ags";
import app from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import Gio from "gi://Gio";

import { pointer, setLayerrules } from "@lib/utils";
import Wallpapers from "@services/wallpapers";

function wallpaperItem(
  wallpapers: Wallpapers,
  [fileName, thumbnail]: string[],
) {
  let Pic: Gtk.Picture;
  return (
    <button
      $={pointer}
      class="item"
      onClicked={() => wallpapers.setWallpaper(Wallpapers.directory + fileName)}
    >
      <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
        <overlay
          $={(self) => {
            self.set_measure_overlay(Pic, true);
            self.set_clip_overlay(Pic, true);
          }}
        >
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
  ) as Gtk.Widget;
}

async function appendWallpapers(self: Gtk.Box, wallpapers: Wallpapers) {
  const scope = getScope();
  const wallpaperInfo = await wallpapers.loadWallpapers();

  for (let i = 0, len = wallpaperInfo.length; i < len; i++) {
    const item = scope.run(() => wallpaperItem(wallpapers, wallpaperInfo[i]));
    self.append(item);
  }
}

export default () => {
  const { CENTER } = Gtk.Align;
  const { EXTERNAL, NEVER } = Gtk.PolicyType;
  const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

  const Spinner = new Gtk.Spinner({
    widthRequest: 40,
    heightRequest: 40,
    halign: CENTER,
    valign: CENTER,
    hexpand: true,
    vexpand: true,
  });

  const wallpapers = Wallpapers.get_default();

  return (
    <window
      $={(self) => {
        setLayerrules(self.namespace, ["blur", "ignorezero", "xray 0"]);
        self.child.widthRequest =
          app.get_monitors()[0].geometry.width -
          self.marginLeft -
          self.marginRight;
      }}
      name="wallpaperPicker"
      namespace="wallpaper-picker"
      class="wallpaper-picker transparent"
      anchor={BOTTOM | LEFT | RIGHT}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.EXCLUSIVE}
      marginRight={12}
      marginBottom={12}
      marginLeft={12}
      application={app}
    >
      <Gtk.EventControllerKey
        onKeyPressed={({ widget }, keyval) => {
          if (keyval === Gdk.KEY_Escape) app.toggle_window(widget.name);
        }}
      />
      <scrolledwindow hscrollbarPolicy={EXTERNAL} vscrollbarPolicy={NEVER}>
        <box
          $={(self) => {
            // Lazy load wallpaper items
            const scope = getScope();
            const mapHandler = self.connect("map", (_self) => {
              Spinner.start();

              scope.run(() =>
                appendWallpapers(_self, wallpapers).then(() => {
                  _self.remove(Spinner);
                  _self.remove_css_class("with-spinner");
                }),
              );

              _self.disconnect(mapHandler);
            });
          }}
          class="with-spinner"
          spacing={8}
        >
          {Spinner}
        </box>
      </scrolledwindow>
    </window>
  );
};
