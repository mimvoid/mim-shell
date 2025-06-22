import PickerList from "./PickerList";
import Converter from "./Converter";
import PopRevealer from "@lib/widgets/PopRevealer";

export default (
  <PopRevealer
    cssClasses={["colors-popover"]}
    name="colorsPopover"
    hasArrow={false}
  >
    <box vertical>
      <Converter />
      <PickerList />
    </box>
  </PopRevealer>
);
