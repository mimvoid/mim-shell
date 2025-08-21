import app from "ags/gtk4/app";
import GObject, { register, getter, property } from "ags/gobject";
import { monitorFile } from "ags/file";
import { execAsync } from "ags/process";

import GLib from "gi://GLib";
import Gio from "gi://Gio";
import { Gtk } from "ags/gtk4";

@register({ GTypeName: "Wallpapers" })
export default class Wallpapers extends GObject.Object {
  static instance: Wallpapers;
  static directory = GLib.get_user_config_dir() + "/wallpapers/";
  static hellwalCss = GLib.get_user_cache_dir() + "/hellwal/colors.css";

  static get_default() {
    if (!this.instance) this.instance = new Wallpapers();
    return this.instance;
  }

  static async loadHellwalCss() {
    app.apply_css(Wallpapers.hellwalCss);
  }

  static async setWallpaper(path: string) {
    execAsync(
      "hellwal --quiet --skip-term-colors --check-contrast -i " + path,
    ).catch(console.error);

    execAsync(
      "swww img --transition-type grow --transition-pos 0.95,0.95 --transition-step 90 " +
        path,
    ).catch(console.error);
  }

  #directory = Gio.File.new_for_path(Wallpapers.directory);
  #directoryList: Gtk.DirectoryList;
  #wallpapers: Gtk.FilterListModel;

  @property(Boolean) loading: boolean;
  @property(Boolean) monitored: boolean;

  constructor() {
    super();

    this.#directoryList = Gtk.DirectoryList.new(
      "standard::display-name,standard::content-type,thumbnail::path",
      this.#directory,
    );

    this.loading = this.#directoryList.loading;
    this.#directoryList.bind_property(
      "loading",
      this,
      "loading",
      GObject.BindingFlags.SYNC_CREATE,
    );

    this.monitored = this.#directoryList.monitored;
    this.#directoryList.bind_property(
      "monitored",
      this,
      "monitored",
      GObject.BindingFlags.BIDIRECTIONAL,
    );

    const filter = new Gtk.FileFilter();
    filter.add_mime_type("image/*");
    this.#wallpapers = Gtk.FilterListModel.new(this.#directoryList, filter);

    monitorFile(Wallpapers.hellwalCss, async (file, e) => {
      if (e === Gio.FileMonitorEvent.CHANGED) app.apply_css(file);
    });
  }

  @getter(Gtk.FilterListModel)
  get wallpapers() {
    return this.#wallpapers;
  }
}
