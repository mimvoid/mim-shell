import GObject, { register, getter } from "ags/gobject";
import { execAsync } from "ags/process";
import GLib from "gi://GLib?version=2.0";

import Backlight from "./backlight";
export { default as Backlight } from "./backlight";

@register({ GTypeName: "Brightness" })
export default class Brightness extends GObject.Object {
  static instance: Brightness;

  static get_default() {
    if (!this.instance) this.instance = new Brightness();
    return this.instance;
  }

  #devices = Array<Backlight>();

  constructor() {
    super();

    execAsync("brightnessctl info --class=backlight --machine-readable")
      .then((info) => {
        const lines = GLib.strsplit(info, "\n", 0);

        for (const line of lines) {
          const backlight = Backlight.new_from_brightnessctl(line);
          this.#devices.push(backlight);
          this.notify("devices");
        }
      })
      .catch(console.error);
  }

  @getter(Array<Backlight>)
  get devices() {
    return this.#devices;
  }
}
