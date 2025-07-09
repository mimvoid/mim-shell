import { createBinding } from "ags";
import WlSunset from "@services/wlsunset";
import Icon from "@lib/icons";

export default () => {
  const wlsunset = WlSunset.get_default();

  const running = createBinding(wlsunset, "running");
  const state = running.as((r) => (r ? "on" : "off"));

  return (
    <togglebutton
      $={(self) => self.set_cursor_from_name("pointer")}
      class="wlsunset-toggle"
      active={running}
      tooltipText={state((s) => "wlsunset " + s)}
      iconName={state((s) => Icon.wlsunset[s])}
      onClicked={() => (wlsunset.running = !wlsunset.running)}
    />
  );
};
