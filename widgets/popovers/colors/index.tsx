import { Gtk } from "ags/gtk4";

import PickerList from "./PickerList";
import Converter from "./Converter";
import PopRevealer from "@lib/widgets/PopRevealer";

export default () => (
  <PopRevealer
    name="colorsPopover"
    class="colors-popover"
    hasArrow={false}
  >
    <box orientation={Gtk.Orientation.VERTICAL}>
      <Converter />
      <PickerList />
    </box>
  </PopRevealer>
);
