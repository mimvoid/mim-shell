import { createBinding, createState, For } from "ags";
import { Gtk, Gdk } from "ags/gtk4";
import { writeFile } from "ags/file";
import Gio from "gi://Gio";

import Picker from "@services/colorpicker";

import Dropdown from "@lib/widgets/Dropdown";
import { hexToRgb, hexToHsl } from "@lib/colors";
import Icons from "@lib/icons";
import { pointer } from "@lib/utils";

const picker = Picker.get_default();
const { START, CENTER, END } = Gtk.Align;
const { VERTICAL } = Gtk.Orientation;

function ColorItem(color: string) {
  const [text, setText] = createState(color);

  const Main = (
    <button
      $={pointer}
      class="main-info"
      hexpand
      onClicked={() => picker.copy(text.get())}
    >
      <box>
        <Gtk.ColorDialogButton
          $={(self) => {
            const gRgb = new Gdk.RGBA();
            gRgb.parse(color);
            self.rgba = gRgb;
          }}
          class="color-box"
          halign={START}
          valign={CENTER}
        />
        <label label={text} halign={START} />
      </box>
    </button>
  );

  const Switcher = (
    <button
      $={pointer}
      label="hex"
      onClicked={(self) => {
        switch (text.get().charAt(0)) {
          case "#":
            const rgb = hexToRgb(color);
            if (rgb) {
              setText(rgb);
              self.label = "rgb";
            }
            break;
          case "r":
            const hsl = hexToHsl(color);
            if (hsl) {
              setText(hsl);
              self.label = "hsl";
            }
            break;
          default:
            setText(color);
            self.label = "hex";
        }
      }}
    />
  );

  const Actions = (
    <box class="actions" halign={END}>
      {Switcher}
      <button
        $={pointer}
        iconName={Icons.actions.close}
        onClicked={() => picker.remove(color)}
      />
    </box>
  );

  return (
    <box class="color-item" hexpand>
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

    FilePicker.save(null, null, (filePicker, res) => {
      const newPath = filePicker?.save_finish(res)?.get_path();
      if (newPath) writeFile(newPath, JSON.stringify(picker.colors));
    });
  }

  return (
    <box spacing={4} halign={END}>
      <button
        $={pointer}
        tooltipText="Save color history to file"
        iconName={Icons.actions.save}
        onClicked={saveColors}
      />
      <button
        $={pointer}
        tooltipText="Clear color history"
        iconName={Icons.actions.clearAll}
        onClicked={() => picker.clear()}
      />
    </box>
  );
}

export default () => (
  <scrolledwindow heightRequest={350}>
    <Dropdown
      class="colorpicker-list"
      label={<label label="History" class="title" halign={START} />}
    >
      <box spacing={8} orientation={VERTICAL}>
        <Actions />
        <For each={createBinding(picker, "colors")}>
          {(color: string) => ColorItem(color)}
        </For>
      </box>
    </Dropdown>
  </scrolledwindow>
);
