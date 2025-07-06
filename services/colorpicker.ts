import GObject, { register, getter, setter } from "ags/gobject";
import { readFile, writeFileAsync } from "ags/file";
import { execAsync, subprocess } from "ags/process";

import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib";
import { sendNotification } from "@lib/notifications";

const MAX_COLORS = 10;

@register({ GTypeName: "Colorpicker" })
export default class Colorpicker extends GObject.Object {
  static instance: Colorpicker;
  static readonly storeFolder = GLib.get_user_state_dir() + "/ags";
  static readonly storeFile = Colorpicker.storeFolder + "/colorpicker.json";

  static get_default() {
    if (!this.instance) this.instance = new Colorpicker();
    return this.instance;
  }

  #colors: string[] = [];

  constructor() {
    super();

    try {
      this.#colors = JSON.parse(readFile(Colorpicker.storeFile));
    } catch (err) {
      err === Gio.IOErrorEnum.NOT_FOUND
        ? writeFileAsync(Colorpicker.storeFile, "[]")
        : console.error(err);
    }
  }

  @getter(Array<string>)
  get colors() {
    return this.#colors;
  }

  @setter(Array<string>)
  set colors(colors) {
    this.#colors = colors;
    this.notify("colors");
    this.updateCache();
  }

  private async updateCache() {
    writeFileAsync(
      Colorpicker.storeFile,
      JSON.stringify(this.#colors, null, 2),
    ).catch(console.error);
  }

  pick() {
    const proc = subprocess(
      "hyprpicker --format=hex --autocopy --no-fancy --lowercase-hex",
      (out) => {
        // Hyprpicker seems to exit in a way that makes execAsync() hang,
        // even if a color has been picked, so this circumvents that
        proc.kill();
        this.add(out);
      },
      (err) => print(err),
    );
  }

  async copy(color: string) {
    execAsync(["wl-copy", color]).catch(console.error);
    sendNotification({
      title: "Colorpicker",
      body: "Copied to clipboard:\n\n" + color,
      icon: "color-select-symbolic",
    });
  }

  add(color: string) {
    const index = this.#colors.indexOf(color);

    if (index === -1) {
      // Color does not already exist, add it
      const length = this.#colors.push(color);
      if (length > MAX_COLORS) this.#colors.shift();
    } else {
      // Move the existing color to the end
      this.#colors.push(this.#colors.splice(index, 1)[0]);
    }

    this.notify("colors");
    this.updateCache();
  }

  remove(color: string) {
    const index = this.#colors.indexOf(color);
    if (index === -1) return;

    this.#colors.splice(index, 1);
    this.notify("colors");
    this.updateCache();
  }

  clear() {
    this.colors = [];
  }
}
