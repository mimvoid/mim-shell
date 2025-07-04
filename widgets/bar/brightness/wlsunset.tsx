import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import WlSunset from "@services/wlsunset";
import Icon from "@lib/icons";

export default () => {
  const wlsunset = WlSunset.get_default();

  const running = createBinding(wlsunset, "running");
  const state = running.as((r) => (r ? "on" : "off"));

  return (
    <button
      $={(self) => {
        self.set_cursor_from_name("pointer");
        running.subscribe(() => {
          running.get()
            ? self.remove_css_class("off")
            : self.add_css_class("off");
        });
      }}
      class={running.get() ? "wlsunset-toggle" : "wlsunset-toggle off"}
      tooltipText={state((s) => "wlsunset " + s)}
      iconName={state((s) => Icon.wlsunset[s])}
      onClicked={() => (wlsunset.running = !wlsunset.running)}
    />
  );
};
