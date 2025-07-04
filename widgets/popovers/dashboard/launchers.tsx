import app from "ags/gtk4/app";
import { Gtk } from "ags/gtk4";
import Icons from "@lib/icons";
import Wallpapers from "../../wallpapers";
import { pointer } from "@lib/utils";

const WallpapersLauncher = () => (
  <button
    $={pointer}
    onClicked={() => {
      const existingWin = app.get_window("wallpaperPicker");
      if (existingWin) {
        existingWin.visible = true;
      } else {
        app.add_window(Wallpapers());
      }
    }}
  >
    <box>
      <image iconName={Icons.mimetypes.image} iconSize={Gtk.IconSize.LARGE} />
      <label label="Change wallpaper" />
    </box>
  </button>
);

export default () => (
  <box class="launchers section" spacing={10} hexpand>
    <WallpapersLauncher />
  </box>
);
