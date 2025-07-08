import app from "ags/gtk4/app";
import GObject, { register, getter } from "ags/gobject";
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

  #wallpapers = Array<Array<string>>();

  constructor() {
    super();

    Gio._promisify(Gio.File.prototype, "enumerate_children_async");
    Gio._promisify(Gio.FileEnumerator.prototype, "next_files_async");

    monitorFile("./style/palette/_matugen.scss", (_, e) => {
      if (e !== Gio.FileMonitorEvent.CHANGED) return;

      exec("sass ./style/style.scss /tmp/ags/style.css");
      app.apply_css("/tmp/ags/style.css", true);
    });
  }

  @getter(Array<Array<string>>)
  get wallpapers() {
    return this.#wallpapers;
  }

  async setWallpaper(path: string) {
    execAsync(
      "matugen image " + path + " -t scheme-rainbow --contrast 0.5 -q",
    ).catch(console.error);
  }

  private async wallpapersEnum() {
    const wpGFile = Gio.File.new_for_path(Wallpapers.directory);

    try {
      // Get childen with a Gio.FileEnumerator object
      const attrs = displayName + "," + fastContentType + "," + thumbnailPath;
      return await wpGFile.enumerate_children_async(
        attrs,
        Gio.FileQueryInfoFlags.NONE,
        GLib.PRIORITY_DEFAULT,
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

  async loadWallpapers() {
    const info = Array<Array<string>>();
    const enumerator = await this.wallpapersEnum();

    if (enumerator) {
      for await (const fileInfo of enumerator) {
        const type = fileInfo.get_attribute_as_string(fastContentType);

        if (type?.startsWith("image")) {
          info.push([
            fileInfo.get_display_name(),
            fileInfo.get_attribute_as_string(thumbnailPath) || "",
          ]);
        }
      }
    }

    this.#wallpapers = info;
    return info;
  }
}
