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
    try {
      this.#running = exec("pidof wlsunset") !== null;
    } catch (err) {
      this.#running = false;
    }
  }

  @getter(Boolean)
  get running() {
    return this.#running;
  }

  @setter(Boolean)
  set running(stat: boolean) {
    execAsync(`systemctl --user ${stat ? "start" : "stop"} wlsunset.service`)
      .then(() => {
        this.#running = stat;
        this.notify("running");
      })
      .catch(console.error);
  }
}
