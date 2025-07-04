import app from "ags/gtk4/app";
import GObject, { register, property } from "ags/gobject";
import { monitorFile } from "ags/file";
import { exec, execAsync } from "ags/process";

import GLib from "gi://GLib";
import Gio from "gi://Gio";

const displayName = Gio.FILE_ATTRIBUTE_STANDARD_DISPLAY_NAME;
const fastContentType = Gio.FILE_ATTRIBUTE_STANDARD_FAST_CONTENT_TYPE;
const thumbnailPath = Gio.FILE_ATTRIBUTE_THUMBNAIL_PATH;

@register({ GTypeName: "Wallpapers" })
export default class Wallpapers extends GObject.Object {
  static instance: Wallpapers;
  static directory = GLib.get_user_config_dir() + "/wallpapers/";

  static get_default() {
    if (!this.instance) this.instance = new Wallpapers();
    return this.instance;
  }

  @property(Array<Array<String>>)
  readonly wallpapers = this.fileInfo();

  constructor() {
    super();

    monitorFile("./style/palette/_matugen.scss", (_, e) => {
      if (e !== Gio.FileMonitorEvent.CHANGED) return;

      exec("sass ./style/style.scss /tmp/ags/style.css");
      app.apply_css("/tmp/ags/style.css", true);
    });
  }

  async setWallpaper(path: string) {
    execAsync(
      "matugen image " + path + " -t scheme-rainbow --contrast 0.5 -q",
    ).catch(console.error);
  }

  private wallpapersEnum() {
    const wpGFile = Gio.File.new_for_path(Wallpapers.directory);

    try {
      // Get childen with a Gio.FileEnumerator object
      const attrs = displayName + "," + fastContentType + "," + thumbnailPath;
      return wpGFile.enumerate_children(
        attrs,
        Gio.FileQueryInfoFlags.NONE,
        null,
      );
    } catch (err) {
      if (err === Gio.IOErrorEnum.NOT_FOUND) {
        wpGFile.make_directory();
      } else {
        console.error(err);
      }
    }
  }

  private fileInfo() {
    const enumerator = this.wallpapersEnum();
    const info: string[][] = [];

    if (enumerator) {
      let file = enumerator.next_file(null);
      while (file !== null) {
        const type = file.get_attribute_as_string(fastContentType);

        if (type?.startsWith("image")) {
          info.push([
            file.get_display_name(),
            file.get_attribute_as_string(thumbnailPath) || "",
          ]);
        }

        file = enumerator.next_file(null);
      }
    }

    return info;
  }
}
