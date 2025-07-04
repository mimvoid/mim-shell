import GObject, { register, getter, setter } from "ags/gobject";
import { monitorFile, readFileAsync } from "ags/file";
import { exec, execAsync } from "ags/process";

@register({ GTypeName: "Brightness" })
export default class Brightness extends GObject.Object {
  static instance: Brightness;

  static get_default() {
    if (!this.instance) this.instance = new Brightness();
    return this.instance;
  }

  #light;

  constructor() {
    super();

    const current = Number(exec("brightnessctl get"));
    const max = Number(exec("brightnessctl max"));
    this.#light = current / max;

    // Update brightness on changes to the file
    const monitor = exec("sh -c 'ls -w1 /sys/class/backlight | head -1'");

    monitorFile(`/sys/class/backlight/${monitor}/brightness`, async (file) => {
      const value = await readFileAsync(file);
      this.#light = Number(value) / max;
      this.notify("light");
    });
  }

  @getter(Number)
  get light() {
    return this.#light;
  }

  @setter(Number)
  set light(percent) {
    // Check for limits
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;

    // Update brightness lights
    this.#light = percent;
    this.notify("light");

    execAsync(`brightnessctl set ${Math.trunc(percent * 100)}% -q`).catch(
      console.error,
    );
  }
}
