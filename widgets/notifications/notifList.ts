import { onCleanup } from "ags";
import Notifd from "gi://AstalNotifd";
import Gio from "gi://Gio?version=2.0";

function findById(a: any, b: any) {
  return (
    a instanceof Notifd.Notification &&
    b instanceof Notifd.Notification &&
    a.id === b.id
  );
}

export default () => {
  const notifd = Notifd.get_default();

  const notifications = Gio.ListStore.new(Notifd.Notification.$gtype);
  notifications.splice(0, 0, notifd.get_notifications()); // Initialize items

  const notifiedId = notifd.connect("notified", (notifdSrc, id, replaced) => {
    const notification = notifdSrc.get_notification(id);

    if (replaced) {
      const [found, position] = notifications.find_with_equal_func(
        notification,
        findById,
      );

      if (found) {
        notifications.splice(position, 1, [notification]);
      }
    }

    notifications.insert(0, notification);
  });

  const resolvedId = notifd.connect("resolved", (_, id) => {
    let i = 0;
    for (const notif of notifications) {
      if (notif instanceof Notifd.Notification && notif.id === id) {
        notifications.remove(i);
        break;
      }
      i++;
    }
  });

  onCleanup(() => {
    notifd.disconnect(notifiedId);
    notifd.disconnect(resolvedId);
  });

  return notifications;
}
