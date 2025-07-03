import { Gtk, hook } from "astal/gtk4";
import Notifd from "gi://AstalNotifd";

import Icons from "@lib/icons";
import { pointer, popButton } from "@lib/utils";

const notifd = Notifd.get_default();

const NotifDnd = (
  <button
    setup={(self) => {
      pointer(self);
      popButton(self);

      function dndHook(button: Gtk.Button) {
        const dnd = notifd.dontDisturb;
        const str = dnd ? "off" : "on";

        dnd ? button.remove_css_class("off") : button.add_css_class("off");
        button.tooltipText = `Turn ${str} Do not Disturb`;
        button.iconName = Icons.notifications[str];
      }

      dndHook(self);
      hook(self, notifd, "notify::dont-disturb", dndHook);
    }}
    cssClasses={["dnd-toggle", "big-toggle"]}
    onClicked={() => (notifd.dontDisturb = !notifd.dontDisturb)}
  />
);

export default () => (
  <box cssClasses={["toggles", "section"]} spacing={10}>
    {NotifDnd}
  </box>
);
