import app from "ags/gtk4/app";
import { For, createBinding, createState, onCleanup } from "ags";
import { Astal, Gtk } from "ags/gtk4";
import { timeout } from "ags/time";

import Notifd from "gi://AstalNotifd";
import { setLayerrules } from "@lib/utils";
import Notification from "./notification";

export default () => {
  const monitors = createBinding(app, "monitors");

  const notifd = Notifd.get_default();
  const TIMEOUT_DELAY = 5000;
  const WINDOW_NAME = "notification-window";

  const { TOP, RIGHT } = Astal.WindowAnchor;

  const [notifications, setNotifications] = createState(
    new Array<Notifd.Notification>(),
  );

  const notifiedId = notifd.connect("notified", (notifdSrc, id, replaced) => {
    const notification = notifdSrc.get_notification(id);
    if (
      notifdSrc.dontDisturb &&
      !replaced &&
      notification.urgency !== Notifd.Urgency.CRITICAL
    ) {
      return;
    }

    if (replaced) {
      const notifs = notifications.get();

      for (let i = 0, len = notifs.length; i < len; i++) {
        if (notifs[i].id === id) {
          notifs[i] = notification;
          setNotifications([...notifs]);
          return;
        }
      }
    }

    setNotifications((ns) => [notification, ...ns]);
  });

  const resolvedId = notifd.connect("resolved", (_, id) => {
    setNotifications((ns) => ns.filter((n) => n.id !== id));
  });

  onCleanup(() => {
    notifd.disconnect(notifiedId);
    notifd.disconnect(resolvedId);
  });

  const Notifications = (
    <box class="notifications" orientation={Gtk.Orientation.VERTICAL}>
      <For each={notifications}>
        {(notif) => {
          const remove = timeout(TIMEOUT_DELAY, () => notif.dismiss());
          const id = notif.id; // used later to check if the notification still exists

          return (
            <Notification
              notification={notif}
              onHoverLeave={() => {
                remove.cancel();
                notifd.get_notification(id)?.dismiss();
              }}
              setup={() => remove}
            />
          );
        }}
      </For>
    </box>
  );

  return (
    <For each={monitors} cleanup={(win) => (win as Gtk.Window).destroy()}>
      {(monitor) => (
        <window
          $={(self) =>
            setLayerrules(self.namespace, [
              "animation slidefade right",
              "blur",
              "ignorezero",
              "xray 0",
            ])
          }
          visible={notifications((ns) => !!ns[0])}
          name={WINDOW_NAME}
          namespace={WINDOW_NAME}
          class="notification-popups transparent"
          gdkmonitor={monitor}
          exclusivity={Astal.Exclusivity.EXCLUSIVE}
          anchor={TOP | RIGHT}
        >
          {Notifications}
        </window>
      )}
    </For>
  );
};
