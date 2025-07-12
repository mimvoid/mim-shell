import { With, createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import WlSunset from "./wlsunset";

import Brightness, { Backlight } from "@services/brightness";
import HoverRevealer from "@lib/widgets/HoverRevealer";
import { drawValuePercentage, pointer } from "@lib/utils";

// Brightness label & slider
function BrightnessSlider(device: Backlight) {
  // Change brightness on drag
  const Slider = (
    <slider
      $={(self) => {
        pointer(self);
        drawValuePercentage(self);
      }}
      value={createBinding(device, "percentage")}
      valign={Gtk.Align.CENTER}
      hexpand
      onChangeValue={({ value }) => void (device.percentage = value)}
    />
  );

  return <HoverRevealer hiddenChild={Slider} />;
}

export default () => {
  const brightness = Brightness.get_default();

  return (
    <box class="brightness">
      <WlSunset />
      <With value={createBinding(brightness, "devices")}>
        {(devices: Backlight[]) => devices[0] && BrightnessSlider(devices[0])}
      </With>
    </box>
  );
};
