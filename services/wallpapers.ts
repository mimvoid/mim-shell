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

  static get_default() {
    if (!this.instance) this.instance = new Wallpapers();
    return this.instance;
  }

  static async setWallpaper(path: string) {
    execAsync(
      "matugen image " + path + " -t scheme-rainbow --contrast 0.5 -q",
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

    monitorFile("./style/palette/_matugen.scss", async (_, e) => {
      if (e !== Gio.FileMonitorEvent.CHANGED) return;

      execAsync("sass ./style/style.scss /tmp/ags/style.css")
        .then(() => app.apply_css("/tmp/ags/style.css", true))
        .catch(console.error);
    });
  }

  @getter(Gtk.FilterListModel)
  get wallpapers() {
    return this.#wallpapers;
  }
}
