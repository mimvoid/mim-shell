import app from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";

import { setLayerrules } from "@lib/utils";
import WallpaperList from "./list";
import Wallpapers from "@services/wallpapers";
import { getScope } from "ags";

// Lazy load wallpaper items
function loadContent(scrollWin: Gtk.ScrolledWindow) {
  const Spinner = (scrollWin.child as Gtk.Viewport).get_child() as Gtk.Spinner;
  Spinner.start();

  const List = WallpaperList();

  const wallpapers = Wallpapers.get_default();
  const loadingHandler = wallpapers.connect(
    "notify::loading",
    (_wallpapers) => {
      if (_wallpapers.loading) return;

      scrollWin.set_child(List);
      scrollWin.remove_css_class("with-spinner");

      _wallpapers.disconnect(loadingHandler);
    },
  );
}

export default () => {
  const { CENTER } = Gtk.Align;
  const { NEVER } = Gtk.PolicyType;
  const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

  const margin = 12;

  return (
    <window
      $={(self) =>
        setLayerrules(self.namespace, ["blur", "ignorezero", "xray 0"])
      }
      name="wallpaperPicker"
      namespace="wallpaper-picker"
      class="wallpaper-picker transparent"
      anchor={BOTTOM | LEFT | RIGHT}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.EXCLUSIVE}
      marginLeft={margin}
      marginRight={margin}
      marginBottom={margin}
      onMap={(self) => self.grab_focus()}
      application={app}
    >
      <Gtk.EventControllerKey
        onKeyPressed={({ widget }, keyval) => {
          if (keyval === Gdk.KEY_Escape) app.toggle_window(widget.name);
        }}
      />
      <scrolledwindow
        $={(self) => {
          const scope = getScope();
          const mapHandler = self.connect("map", (_self) => {
            scope.run(() => loadContent(_self));
            _self.disconnect(mapHandler);
          });
        }}
        class="with-spinner"
        widthRequest={app.get_monitors()[0].geometry.width - 2 * margin}
        vscrollbarPolicy={NEVER}
      >
        <Gtk.Viewport>
          <Gtk.Spinner
            widthRequest={40}
            heightRequest={40}
            halign={CENTER}
            valign={CENTER}
            hexpand
            vexpand
          />
        </Gtk.Viewport>
      </scrolledwindow>
    </window>
  );
};
