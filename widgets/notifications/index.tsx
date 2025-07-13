import { For, createBinding, getScope } from "ags";
import GObject from "ags/gobject";
import app from "ags/gtk4/app";
import { Astal, Gtk } from "ags/gtk4";

import Gio from "gi://Gio?version=2.0";
import Notifd from "gi://AstalNotifd";

import { setLayerrules } from "@lib/utils";
import Notification from "./notification";
import NotificationList from "./notifList";

function isCritical(item: GObject.Object) {
  return (
    item instanceof Notifd.Notification &&
    item.urgency === Notifd.Urgency.CRITICAL
  );
}

function notifWidgetList(notifs: Gio.ListStore) {
  const filter = Gtk.CustomFilter.new(null);
  const notifModel = Gtk.FilterListModel.new(notifs, filter);

  const notifd = Notifd.get_default();
  const dndHandler = notifd.connect("notify::dont-disturb", (notifdSrc) => {
    filter.set_filter_func(notifdSrc.dontDisturb ? isCritical : null);
  });

  const scope = getScope();
  function setListItem(
    _factory: Gtk.SignalListItemFactory,
    item: GObject.Object,
  ) {
    const listItem = item as Gtk.ListItem;
    const notif = listItem.item;
    if (notif instanceof Notifd.Notification) {
      scope.run(() =>
        listItem.set_child(Notification(notif)),
      );
    }
  }

  return (
    <Gtk.ListView
      class="notifications"
      model={Gtk.NoSelection.new(notifModel)}
      factory={
        <Gtk.SignalListItemFactory onSetup={setListItem} onBind={setListItem} />
      }
      onDestroy={() => notifd.disconnect(dndHandler)}
    />
  );
}

function winInit(win: Astal.Window) {
  win.namespace = win.name;
  setLayerrules(win.namespace, [
    "animation slidefade right",
    "blur",
    "ignorezero",
    "xray 0",
  ]);
}

export default () => {
  const { TOP, RIGHT } = Astal.WindowAnchor;
  const monitors = createBinding(app, "monitors");

  const notifications = NotificationList();
  const hasNotifs = createBinding(notifications, "n_items").as((n) => n > 0);

  return (
    <For each={monitors} cleanup={(win) => (win as Gtk.Window).destroy()}>
      {(monitor) => (
        <window
          $={winInit}
          visible={hasNotifs}
          name="notification-window"
          class="notification-popups transparent"
          gdkmonitor={monitor}
          exclusivity={Astal.Exclusivity.EXCLUSIVE}
          anchor={TOP | RIGHT}
        >
          {notifWidgetList(notifications)}
        </window>
      )}
    </For>
  );
};
