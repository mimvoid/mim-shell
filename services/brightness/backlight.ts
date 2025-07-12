import GObject, { register, getter, setter } from "ags/gobject";
import { monitorFile, readFileAsync } from "ags/file";
import { execAsync } from "ags/process";
import { Percent } from "@lib/GObjectTypes";
import GLib from "gi://GLib?version=2.0";

@register({ GTypeName: "Backlight" })
export default class Backlight extends GObject.Object {
  declare static $gtype: GObject.GType<Backlight>;

  #percentage: number;
  readonly #name: string;
  readonly #max: number;

  static new_from_brightnessctl(info: string) {
    const [name, _class, _value, percentStr, max] = GLib.strsplit(info, ",", 5);

    const percentage = Number(percentStr.substring(0, percentStr.length - 1)) / 100;
    return new Backlight(name, percentage, Number(max));
  }

  constructor(name: string, percentage: number, max: number) {
    super();

    this.#name = name;
    this.#percentage = percentage;
    this.#max = max;

    monitorFile(`/sys/class/backlight/${name}/brightness`, async (file) => {
      const value = await readFileAsync(file);
      this.#percentage = Number(value) / max;
      this.notify("percentage");
    });
  }

  @getter(String)
  get name() {
    return this.#name;
  }

  @getter(Number)
  get max() {
    return this.#max;
  }

  @getter(Percent)
  get percentage() {
    return this.#percentage;
  }

  @setter(Percent)
  set percentage(percent) {
    // Check for limits
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;

    // Update brightness lights
    this.#percentage = percent;
    this.notify("percentage");

    execAsync(`brightnessctl set ${Math.trunc(percent * 100)}% -q`).catch(
      console.error,
    );
  }
}
