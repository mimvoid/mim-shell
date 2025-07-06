import app from "ags/gtk4/app";
import Gio from "gi://Gio?version=2.0";

export interface NotificationProps {
  title: string;
  body?: string | null;
  icon?: Gio.Icon | string;
  priority?: Gio.NotificationPriority;
  category?: string;
}

export function makeNotification({
  title,
  body,
  icon,
  priority,
  category,
}: NotificationProps) {
  const notification = Gio.Notification.new(title);
  if (body) notification.set_body(body);

  if (icon) {
    try {
      notification.set_icon(
        icon instanceof Gio.Icon ? icon : Gio.Icon.new_for_string(icon),
      );
    } catch (err) {
      console.error(err);
    }
  }

  if (priority) notification.set_priority(priority);
  if (category) notification.set_category(category);

  return notification;
}

export function sendSimpleNotification(title: string, body: string) {
  const notification = Gio.Notification.new(title);
  notification.set_body(body);
  app.send_notification(null, notification);
}

export function sendNotification(props: NotificationProps, id?: string | null) {
  const notification = makeNotification(props);
  app.send_notification(id || null, notification);
}
