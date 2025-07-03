import { Gtk, hook } from "astal/gtk4";
import WlSunset from "@services/wlsunset";
import Icon from "@lib/icons";

const wlsunset = WlSunset.get_default();

// Wlsunset toggler
function runningHook(button: Gtk.Button) {
  if (wlsunset.running) {
    button.remove_css_class("off");
    button.tooltipText = "wlsunset on";
    button.iconName = Icon.wlsunset.on;
  } else {
    button.add_css_class("off");
    button.tooltipText = "wlsunset off";
    button.iconName = Icon.wlsunset.off;
  }
}

export default () => (
  <button
    setup={(self) => {
      self.set_cursor_from_name("pointer");

      runningHook(self);
      hook(self, wlsunset, "notify::running", runningHook);
    }}
    cssClasses={["wlsunset-toggle"]}
    onClicked={() => (wlsunset.running = !wlsunset.running)}
  />
);
