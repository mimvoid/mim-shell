import app from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";

import Icon from "@lib/icons";
import { pointer, setLayerrules } from "@lib/utils";
import { exec } from "ags/process";

function Session() {
  const { START, END } = Gtk.Align;
  const actions = [
    ["lock", "hyprlock"],
    ["logout", "hyprctl dispatch exit"],
    ["reboot", "systemctl reboot"],
    ["shutdown", "systemctl poweroff"],
  ];

  return (
    <Gtk.Grid
      $={(self) => {
        for (let i = 0; i < 4; i++) {
          const [name, command] = actions[i];
          const [halign, hcell] = i <= 1 ? [END, 1] : [START, 2];
          const [valign, vcell] = i % 2 == 0 ? [END, 1] : [START, 2];

          const Button = (
            <button
              $={pointer}
              name={name}
              class="box"
              halign={halign}
              valign={valign}
              onClicked={() => exec(command)}
              iconName={Icon.powermenu[name]}
            />
          ) as Gtk.Button;

          self.attach(Button, hcell, vcell, 1, 1);
        }
      }}
      rowHomogeneous
      columnHomogeneous
      columnSpacing={2}
      rowSpacing={2}
    />
  );
}

export default () => (
  <window
    $={(self) =>
      setLayerrules(self.namespace, [
        "animation popin 75%",
        "blur",
        "ignorezero",
        "xray 0",
      ])
    }
    name="session"
    namespace="session"
    class="session"
    visible={false}
    anchor={Astal.WindowAnchor.NONE}
    layer={Astal.Layer.OVERLAY}
    keymode={Astal.Keymode.EXCLUSIVE}
    application={app}
  >
    <Gtk.EventControllerKey
      onKeyPressed={({ widget }, keyval) => {
        if (keyval === Gdk.KEY_Escape) app.toggle_window(widget.name);
      }}
    />
    <Session />
  </window>
);
