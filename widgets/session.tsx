import { exec } from "astal";
import { App, Astal, Gtk, Gdk } from "astal/gtk4";

import Icon from "@lib/icons";
import { setLayerrules } from "@lib/utils";
import { Grid } from "@lib/astalified";

const Session = () => (
  <Grid
    setup={(self) => {
      const { START, END } = Gtk.Align;
      const actions: string[][] = [
        ["lock", "hyprlock"],
        ["logout", "hyprctl dispatch exit"],
        ["reboot", "systemctl reboot"],
        ["shutdown", "systemctl poweroff"],
      ];

      for (let i = 0; i < 4; i++) {
        const [name, command] = actions[i]
        const [halign, hcell] = i <= 1 ? [END, 1] : [START, 2];
        const [valign, vcell] = i % 2 == 0 ? [END, 1] : [START, 2];

        const Button = (
          <button
            setup={(self) => self.set_cursor_from_name("pointer")}
            name={name}
            cssClasses={["box"]}
            halign={halign}
            valign={valign}
            onClicked={() => exec(command)}
            iconName={Icon.powermenu[name]}
          />
        );

        self.attach(Button, hcell, vcell, 1, 1);
      }
    }}
    rowHomogeneous
    columnHomogeneous
    columnSpacing={2}
    rowSpacing={2}
  />
);

export default () => (
  <window
    setup={(self) =>
      setLayerrules(self.namespace, [
        "animation popin 75%",
        "blur",
        "ignorezero",
        "xray 0",
      ])
    }
    name="session"
    namespace="session"
    cssClasses={["session"]}
    visible={false}
    anchor={Astal.WindowAnchor.NONE}
    exclusivity={Astal.Exclusivity.NORMAL}
    layer={Astal.Layer.OVERLAY}
    keymode={Astal.Keymode.EXCLUSIVE}
    onKeyPressed={({ name }, keyval) => {
      if (keyval === Gdk.KEY_Escape) App.toggle_window(name);
    }}
    application={App}
  >
    {Session()}
  </window>
);
