import { createBinding } from "ags";
import { Gtk, Gdk } from "ags/gtk4";

import Picker from "@services/colorpicker";
import HoverRevealer from "@lib/widgets/HoverRevealer";
import Icons from "@lib/icons";
import { pointer } from "@lib/utils";
import ColorsPopover from "../popovers/colors";

export default () => {
  const picker = Picker.get_default();
  const lastColor = createBinding(picker, "colors").as(
    (c) => c.at(-1) || "#000000",
  );

  const Trigger = (
    <button
      $={pointer}
      class="color-button"
      onClicked={() => picker.pick()}
      tooltipText={lastColor((c) => "Last color: " + c)}
      iconName={Icons.colorpicker}
    />
  );

  function Color() {
    function colorSub(self: Gtk.ColorDialogButton) {
      const newRgba = new Gdk.RGBA();
      if (newRgba.parse(lastColor.get())) {
        self.rgba = newRgba;
      }
    }

    // A circle showing the last picked color
    const colorDisplay = (
      <Gtk.ColorDialogButton
        $={(self) => {
          colorSub(self);
          lastColor.subscribe(() => colorSub(self));
        }}
        class="color-display"
      />
    );

    // Include a color label and the circle
    return (
      <menubutton>
        <HoverRevealer
          hiddenChild={
            <box class="color-box">
              <label label={lastColor} />
              {colorDisplay}
            </box>
          }
        >
          {Trigger}
        </HoverRevealer>
        <ColorsPopover />
      </menubutton>
    );
  }

  return (
    <box class="colorpicker">
      <Color />
    </box>
  );
};
