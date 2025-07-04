import { createState } from "ags";
import { Gtk, Gdk } from "ags/gtk4";

import Picker from "@services/colorpicker";
import Dropdown from "@lib/widgets/Dropdown";
import Icons from "@lib/icons";
import { gRgbaToHex, gRgbaToHsl } from "@lib/colors";
import { pointer } from "@lib/utils";

const { VERTICAL } = Gtk.Orientation;

export default () => {
  const picker = Picker.get_default();
  const [color, setColor] = createState(
    new Gdk.RGBA({
      red: 245 / 255,
      green: 189 / 255,
      blue: 230 / 255,
      alpha: 1.0,
    }),
  );

  function updateColor(value: string) {
    const rgba = new Gdk.RGBA();
    if (rgba.parse(value)) setColor(rgba);
  }
  const lastColor = picker.colors.at(-1);
  if (lastColor) updateColor(lastColor);

  const Entry = (
    <entry
      placeholderText={color((c) => c.to_string())}
      onNotifyText={(self) => updateColor(self.text)}
    />
  ) as Gtk.Entry;

  function Switcher() {
    const Display = (
      <Gtk.ColorDialogButton
        $={(self) => {
          const id = picker.connect("notify::colors", () => {
            // Update the color Variable if no text has been saved
            if (!!Entry.text) return;

            const lastColor = picker.colors.at(-1);
            if (lastColor) updateColor(lastColor);
          });
          self.connect("destroy", () => picker.disconnect(id));
        }}
        rgba={color}
        class="color-box"
        hexpand
        vexpand
      />
    );

    function updateLabel(value: string) {
      Entry.placeholderText = value;
      Entry.text = value;
    }
    const rgb = () => updateLabel(color.get().to_string());
    const hex = () => updateLabel(gRgbaToHex(color.get()));
    const hsl = () => updateLabel(gRgbaToHsl(color.get()));

    const Formats = (
      <box spacing={4} orientation={VERTICAL} halign={Gtk.Align.END}>
        <button $={pointer} label="hex" onClicked={hex} />
        <button $={pointer} label="rgb" onClicked={rgb} />
        <button $={pointer} label="hsl" onClicked={hsl} />
      </box>
    );

    return (
      <box class="color-switcher" spacing={8} hexpand>
        {Display}
        {Formats}
      </box>
    );
  }

  function EntryBox() {
    function clear() {
      Entry.placeholderText = color.get().to_string();
      Entry.text = "";
    }

    const buttons = [
      {
        icon: Icons.actions.save,
        tooltip: "Add color to history",
        cmd: () => {
          picker.add(gRgbaToHex(color.get()));
          clear();
        },
      },
      {
        icon: Icons.actions.copy,
        tooltip: "Copy color to clipboard",
        cmd: () => picker.copy(Entry.placeholderText),
      },
      {
        icon: Icons.actions.clear,
        tooltip: "Clear color text",
        cmd: clear,
      },
      {
        icon: Icons.colorpicker,
        tooltip: "Pick color",
        cmd: () => picker.pick(),
      },
    ];

    return (
      <box orientation={VERTICAL} spacing={8}>
        {Entry}
        <box spacing={4} halign={Gtk.Align.END}>
          {buttons.map(({ icon, tooltip, cmd }) => (
            <button
              $={pointer}
              onClicked={cmd}
              tooltipText={tooltip}
              iconName={icon}
            />
          ))}
        </box>
      </box>
    );
  }

  return (
    <Dropdown label={<label label="Color Selector" class="title" />}>
      <box class="converter" orientation={VERTICAL} spacing={8}>
        <Switcher />
        <EntryBox />
      </box>
    </Dropdown>
  );
};
