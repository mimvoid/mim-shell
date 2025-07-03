import { bind, Variable, writeFile } from "astal";
import { Gtk, Gdk } from "astal/gtk4";
import Gio from "gi://Gio";

import Picker from "@services/colorpicker";

import Dropdown from "@lib/widgets/Dropdown";
import { ColorDialogButton, ScrolledWindow } from "@lib/astalified";
import { hexToRgb, hexToHsl } from "@lib/colors";
import Icons from "@lib/icons";
import { pointer } from "@lib/utils";

const picker = Picker.get_default();
const { START, CENTER, END } = Gtk.Align;

function ColorItem(color: string) {
  const text = Variable(color);

  const Main = (
    <button
      setup={pointer}
      onClicked={() => picker.copy(text.get())}
      cssClasses={["main-info"]}
      hexpand
    >
      <box>
        <ColorDialogButton
          setup={(self) => {
            const gRgb = new Gdk.RGBA();
            gRgb.parse(color);
            self.rgba = gRgb;
          }}
          cssClasses={["color-box"]}
          halign={START}
          valign={CENTER}
        />
        <label label={bind(text)} halign={START} />
      </box>
    </button>
  );

  const Switcher = (
    <button
      setup={pointer}
      label="hex"
      onClicked={(self) => {
        switch (text.get().charAt(0)) {
          case "#":
            const rgb = hexToRgb(color);
            if (rgb) {
              text.set(rgb);
              self.label = "rgb";
            }
            break;
          case "r":
            const hsl = hexToHsl(color);
            if (hsl) {
              text.set(hsl);
              self.label = "hsl";
            }
            break;
          default:
            text.set(color);
            self.label = "hex";
        }
      }}
    />
  );

  const Actions = (
    <box className="actions" halign={END}>
      {Switcher}
      <button
        setup={pointer}
        iconName={Icons.actions.close}
        onClicked={() => picker.remove(color)}
      />
    </box>
  );

  return (
    <box cssClasses={["color-item"]} hexpand onDestroy={() => text.drop()}>
      {Main}
      {Actions}
    </box>
  );
}

function Actions() {
  function saveColors() {
    const FilePicker = new Gtk.FileDialog({
      acceptLabel: "Save",
      initialFolder: Gio.File.new_for_path(Picker.storeFolder),
      initialName: "color-history.json",
    });

    FilePicker.save(null, null, (_, res) => {
      const newPath = FilePicker.save_finish(res)?.get_path();
      if (newPath) writeFile(newPath, JSON.stringify(picker.colors));
    });
  }

  return (
    <box spacing={4} halign={END}>
      <button
        setup={pointer}
        onClicked={saveColors}
        tooltipText="Save color history to file"
        iconName={Icons.actions.save}
      />
      <button
        setup={pointer}
        onClicked={() => picker.clear()}
        tooltipText="Clear color history"
        iconName={Icons.actions.clearAll}
      />
    </box>
  );
}

export default () => {
  const Colors = bind(picker, "colors").as((c) =>
    c.map((color) => ColorItem(color)),
  );

  return (
    <ScrolledWindow heightRequest={350}>
      <Dropdown
        cssClasses={["colorpicker-list"]}
        label={<label label="History" cssClasses={["title"]} halign={START} />}
      >
        <box spacing={8} vertical>
          <Actions />
          {Colors}
        </box>
      </Dropdown>
    </ScrolledWindow>
  );
};
