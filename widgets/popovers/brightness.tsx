import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";

import Brightness from "@services/brightness";
import WlSunset from "@services/wlsunset";

import Icon from "@lib/icons";
import { pointer, toPercentage } from "@lib/utils";

const brightness = Brightness.get_default();
const wlsunset = WlSunset.get_default();
const { START, CENTER, END } = Gtk.Align;

function WlStatus() {
  const onClicked = () => (wlsunset.running = !wlsunset.running);

  const running = createBinding(wlsunset, "running");
  const state = running((r) => (r ? "on" : "off"));

  return (
    <box class="status section">
      <button $={pointer} onClicked={onClicked}>
        <image
          iconName={state((s) => Icon.wlsunset[s])}
          iconSize={Gtk.IconSize.LARGE}
        />
      </button>
      <label label={state((s) => "wlsunset " + s)} halign={START} />
    </box>
  );
}

function BrightnessSlider() {
  const light = createBinding(brightness, "light");

  return (
    <box>
      <slider $={pointer} value={light} valign={CENTER} hexpand />
      <label label={light(toPercentage)} />
    </box>
  );
}

export default (
  <popover
    class="brightness-popover popover"
    valign={START}
    halign={END}
    hasArrow={false}
  >
    <box orientation={Gtk.Orientation.VERTICAL}>
      <WlStatus />
      <BrightnessSlider />
    </box>
  </popover>
);
