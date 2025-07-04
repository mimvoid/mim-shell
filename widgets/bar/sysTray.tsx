import { createBinding, For } from "ags";
import { Gtk } from "ags/gtk4";
import Tray from "gi://AstalTray";
import Icon from "@lib/icons";
import { pointer } from "@lib/utils";

function setupTrayItem(self: Gtk.MenuButton, item: Tray.TrayItem) {
  self.insert_action_group("dbusmenu", item.action_group);
  item.connect("notify::action-group", (itemSrc) =>
    self.insert_action_group("dbusMenu", itemSrc.action_group),
  );
}

export default () => {
  const tray = Tray.get_default();
  const items = createBinding(tray, "items");

  // Create buttons for every system tray item
  const TrayIcons = (
    <box spacing={8}>
      <For each={items}>
        {(item) => (
          <menubutton
            $={(self) => setupTrayItem(self, item)}
            class="system-tray-item"
            tooltipMarkup={createBinding(item, "tooltipMarkup")}
            menuModel={item.menuModel}
          >
            <image $={pointer} gicon={createBinding(item, "gicon")} />
          </menubutton>
        )}
      </For>
    </box>
  );

  const ToggleIcon = new Gtk.Image({
    cssClasses: ["hider"],
    iconName: Icon.hider,
  });

  // Display system tray after clicking on a button
  const Revealer = (
    <revealer
      transitionDuration={250}
      transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
      onNotifyRevealChild={({ reveal_child }) =>
        reveal_child
          ? ToggleIcon.add_css_class("open")
          : ToggleIcon.remove_css_class("open")
      }
    >
      {TrayIcons}
    </revealer>
  ) as Gtk.Revealer;

  // Don't actually include the revealer in the hitbox
  const SysTrayToggle = (
    <button
      $={(self) => {
        pointer(self);

        const itemAddedId = tray.connect("item-added", (traySrc) => {
          if (!traySrc.items[1]) {
            self.add_css_class("non-empty"); // The tray was empty before
          }
        });
        const itemRemovedId = tray.connect("item-removed", (traySrc) => {
          if (!traySrc.items[0]) {
            self.remove_css_class("non-empty"); // The tray is now empty
          }
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
        {ToggleIcon}
      </box>
    </button>
  );

  return (
    <box class="system-tray">
      {Revealer}
      {SysTrayToggle}
    </box>
  );
};
