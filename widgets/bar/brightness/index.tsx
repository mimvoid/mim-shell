import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import WlSunset from "./wlsunset";

import Brightness from "@services/brightness";
import HoverRevealer from "@lib/widgets/HoverRevealer";
import { drawValuePercentage, pointer } from "@lib/utils";

// Brightness label & slider
function BrightnessBox() {
  const brightness = Brightness.get_default();

  // Change brightness on drag
  const Slider = (
    <slider
      $={(self) => {
        pointer(self);
        drawValuePercentage(self);
      }}
      value={createBinding(brightness, "light")}
      valign={Gtk.Align.CENTER}
      hexpand
      onChangeValue={({ value }) => void (brightness.light = value)}
    />
  );

  return <HoverRevealer hiddenChild={Slider} />;
}

export default () => (
  <box class="brightness">
    <WlSunset />
    <BrightnessBox />
  </box>
);
