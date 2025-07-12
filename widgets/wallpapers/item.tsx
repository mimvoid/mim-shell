import { Astal, Gtk } from "ags/gtk4";
import { register } from "ags/gobject";
import Gio from "gi://Gio?version=2.0";

import Wallpapers from "@services/wallpapers";

@register({ GTypeName: "WallpaperItem" })
export default class WallpaperItem extends Astal.Box {
  #picture: Gtk.Picture;
  #label: Gtk.Label;

  constructor() {
    super({
      cssClasses: ["item"],
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 8,
    });
    this.set_cursor_from_name("pointer");

    this.#picture = new Gtk.Picture({
      heightRequest: 144,
      widthRequest: 256,
      contentFit: Gtk.ContentFit.COVER,
    });
    this.#label = new Gtk.Label({ cssClasses: ["filename"] });

    this.append(this.#picture);
    this.append(this.#label);
  }

  setFileInfo(fileInfo: Gio.FileInfo) {
    const displayName = fileInfo.get_display_name();
    const thumbnail = fileInfo.get_attribute_byte_string("thumbnail::path");

    this.#picture.set_file(
      Gio.File.new_for_path(thumbnail || Wallpapers.directory + displayName),
    );
    this.#label.set_text(displayName);
  }
}
