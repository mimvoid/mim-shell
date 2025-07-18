import GObject, { register, getter, setter } from "ags/gobject";
import { exec, execAsync } from "ags/process";

@register({ GTypeName: "wlsunset" })
export default class WlSunset extends GObject.Object {
  static instance: WlSunset;

  static get_default() {
    if (!this.instance) this.instance = new WlSunset();
    return this.instance;
  }

  #running;

  constructor() {
    super();

    // Use pidof's error code to see if wlsunset is running.
    try {
      exec("pidof -q wlsunset");
      this.#running = true;
    } catch (_) {
      this.#running = false;
    }
  }

  @getter(Boolean)
  get running() {
    return this.#running;
  }

  @setter(Boolean)
  set running(running: boolean) {
    execAsync(`systemctl --user ${running ? "start" : "stop"} wlsunset.service`)
      .then(() => {
        this.#running = running;
        this.notify("running");
      })
      .catch(console.error);
  }
}
