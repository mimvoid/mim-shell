import app from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";

import { setLayerrules } from "@lib/utils";
import WallpaperList from "./list";
import Wallpapers from "@services/wallpapers";
import { getScope } from "ags";

// Lazy load wallpaper items
function loadContent(box: Gtk.Box) {
  const Spinner = box.get_first_child() as Gtk.Spinner;
  Spinner.start();

  const List = WallpaperList();
  box.append(List);

  const wallpapers = Wallpapers.get_default();
  const loadingHandler = wallpapers.connect(
    "notify::loading",
    (_wallpapers) => {
      if (_wallpapers.loading) return;

      List.set_visible(true);
      box.remove(Spinner);
      box.remove_css_class("with-spinner");

      _wallpapers.disconnect(loadingHandler);
    },
  );
}

function Content() {
  const { CENTER } = Gtk.Align;

  const Spinner = (
    <Gtk.Spinner
      widthRequest={40}
      heightRequest={40}
      halign={CENTER}
      valign={CENTER}
      hexpand
      vexpand
    />
  );

  return (
    <box
      $={(self) => {
        const scope = getScope();
        const mapHandler = self.connect("map", (_self) => {
          scope.run(() => loadContent(_self));
          _self.disconnect(mapHandler);
        });
      }}
      class="with-spinner"
    >
      {Spinner}
    </box>
  );
}

export default () => {
  const { EXTERNAL, NEVER } = Gtk.PolicyType;
  const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

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
      onMap={(self) => self.grab_focus()}
      application={app}
    >
      <Gtk.EventControllerKey
        onKeyPressed={({ widget }, keyval) => {
          if (keyval === Gdk.KEY_Escape) app.toggle_window(widget.name);
        }}
      />
      <scrolledwindow hscrollbarPolicy={EXTERNAL} vscrollbarPolicy={NEVER}>
        <Content />
      </scrolledwindow>
    </window>
  );
};
