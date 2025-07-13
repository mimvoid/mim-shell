import Wallpapers from "@services/wallpapers";
import { Gtk } from "ags/gtk4";
import Gio from "gi://Gio?version=2.0";
import WallpaperItem from "./item";

export default () => {
  const wallpapers = Wallpapers.get_default().wallpapers;
  const selection = Gtk.SingleSelection.new(wallpapers);

  const factory = (
    <Gtk.SignalListItemFactory
      onSetup={(_, item) =>
        (item as Gtk.ListItem).set_child(new WallpaperItem())
      }
      onBind={(_, item) => {
        const listItem = item as Gtk.ListItem;
        const fileInfo = listItem.item;

        if (fileInfo instanceof Gio.FileInfo) {
          (listItem.child as WallpaperItem).setFileInfo(fileInfo);
        }
      }}
    />
  ) as Gtk.SignalListItemFactory;

  return (
    <Gtk.ListView
      model={selection}
      factory={factory}
      singleClickActivate
      orientation={Gtk.Orientation.HORIZONTAL}
      onActivate={async (self, position) => {
        const file = self.model.get_item(position);
        if (file instanceof Gio.FileInfo) {
          Wallpapers.setWallpaper(
            Wallpapers.directory + file.get_display_name(),
          );
        }
      }}
      onDestroy={(self) => {
        const model = (self.model as Gtk.SingleSelection).get_model();
        if (model instanceof Gtk.DirectoryList) {
          model.monitored = false;
        }
      }}
    />
  ) as Gtk.ListView;
};
