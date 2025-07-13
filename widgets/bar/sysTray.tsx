import { createBinding, For } from "ags";
import { Gtk } from "ags/gtk4";
import Tray from "gi://AstalTray";
import Icon from "@lib/icons";
import { pointer } from "@lib/utils";

const TrayItem = (item: Tray.TrayItem) => (
  <menubutton
    $={(self) => {
      self.insert_action_group("dbusmenu", item.action_group);
      item.connect("notify::action-group", (itemSrc) =>
        self.insert_action_group("dbusMenu", itemSrc.action_group),
      );
    }}
    class="system-tray-item"
    tooltipMarkup={createBinding(item, "tooltipMarkup")}
    menuModel={item.menuModel}
  >
    <image $={pointer} gicon={createBinding(item, "gicon")} />
  </menubutton>
);

export default () => {
  const tray = Tray.get_default();

  // Create buttons for every system tray item
  const TrayIcons = (
    <box spacing={8}>
      <For each={createBinding(tray, "items")}>{TrayItem}</For>
    </box>
  );

  // Display system tray after clicking on a button
  const Revealer = (
    <revealer
      transitionDuration={250}
      transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
    >
      {TrayIcons}
    </revealer>
  ) as Gtk.Revealer;

  // Don't actually include the revealer in the hitbox
  const SysTrayToggle = (
    <togglebutton
      $={(self) => {
        pointer(self);

        const itemAddedId = tray.connect("item-added", (traySrc) => {
          !traySrc.items[1] && self.add_css_class("non-empty"); // Tray was empty before
        });

        const itemRemovedId = tray.connect("item-removed", (traySrc) => {
          !traySrc.items[0] && self.remove_css_class("non-empty"); // Tray is now empty
        });

        self.connect("destroy", () => {
          tray.disconnect(itemAddedId);
          tray.disconnect(itemRemovedId);
        });
      }}
      class={tray.items[0] ? "hider-wrapper non-empty" : "hider-wrapper"}
      onClicked={() => (Revealer.revealChild = !Revealer.revealChild)}
    >
      <box>
        <box class="indicator" />
        <image class="hider" iconName={Icon.hider} />
      </box>
    </togglebutton>
  );

  return (
    <box class="system-tray">
      {Revealer}
      {SysTrayToggle}
    </box>
  );
};
