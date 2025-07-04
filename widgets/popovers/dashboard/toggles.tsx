import Notifd from "gi://AstalNotifd";

import Icons from "@lib/icons";
import { pointer, popButton } from "@lib/utils";
import { createBinding } from "ags";

const notifd = Notifd.get_default();

function NotifDnd() {
  const dnd = createBinding(notifd, "dontDisturb");
  const state = dnd((d) => (d ? "off" : "on"));

  return (
    <button
      $={(self) => {
        pointer(self);
        popButton(self);

        dnd.subscribe(() =>
          dnd.get() ? self.remove_css_class("off") : self.add_css_class("off"),
        );
      }}
      class="dnd-toggle big-toggle"
      tooltipText={state((s) => `Turn ${s} Do not Disturb`)}
      iconName={state((s) => Icons.notifications[s])}
      onClicked={() => (notifd.dontDisturb = !notifd.dontDisturb)}
    />
  );
}

export default () => (
  <box class="toggles section" spacing={10}>
    <NotifDnd />
  </box>
);
