import { Astal, Gtk } from "ags/gtk4";
import { property, register } from "ags/gobject";
import Gio from "gi://Gio?version=2.0";

import Wallpapers from "@services/wallpapers";

@register({ GTypeName: "WallpaperItem" })
export default class WallpaperItem extends Astal.Box {
  @property(Gtk.Picture) picture = new Gtk.Picture({
    heightRequest: 144,
    widthRequest: 256,
    contentFit: Gtk.ContentFit.COVER,
  });

  @property(Gtk.Label) label = new Gtk.Label({ cssClasses: ["filename"] });

  constructor() {
    super({
      cssClasses: ["item"],
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 8,
    });
    this.set_cursor_from_name("pointer");

    this.append(this.picture);
    this.append(this.label);
  }

  setFileInfo(fileInfo: Gio.FileInfo) {
    const displayName = fileInfo.get_display_name();
    const thumbnail = fileInfo.get_attribute_byte_string("thumbnail::path");

    this.picture.set_file(
      Gio.File.new_for_path(thumbnail || Wallpapers.directory + displayName),
    );
    this.label.set_text(displayName);
  }
}
