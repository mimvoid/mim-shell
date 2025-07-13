// Defines an individual notification widget

import { Gtk, Gdk } from "ags/gtk4";
import { timeout } from "ags/time";
import Notifd from "gi://AstalNotifd";
import GLib from "gi://GLib?version=2.0";
import Pango from "gi://Pango";
import { pointer } from "@lib/utils";

function isIcon(icon: string | null) {
  if (!icon) return false;

  const iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!);
  return iconTheme.has_icon(icon);
}

function fileExists(path: string) {
  return !!path && GLib.file_test(path, GLib.FileTest.EXISTS);
}

function time(time: number, format = "%H:%M") {
  return GLib.DateTime.new_from_unix_local(time).format(format)!;
}

function urgency(n: Notifd.Notification) {
  switch (n.urgency) {
    case Notifd.Urgency.LOW:
      return "low";
    case Notifd.Urgency.CRITICAL:
      return "critical";
    default:
      return "normal";
  }
}

export default (n: Notifd.Notification) => {
  const { START } = Gtk.Align;
  const { VERTICAL } = Gtk.Orientation;
  const TIMEOUT_DELAY = 5000;

  function makeImage() {
    if (isIcon(n.image)) {
      return <image class="icon-image" iconName={n.image} />;
    }
    if (fileExists(n.image)) {
      return <image class="image" valign={START} file={n.image} />;
    }
  }

  function Icon() {
    if (n.appIcon) {
      return <image class="app-icon" iconName={n.appIcon} />;
    }
    return (
      makeImage() || (
        <image class="app-icon" iconName="dialog-information-symbolic" />
      )
    );
  }

  const Header = (
    <box class="header">
      <label
        class="app-name"
        label={n.appName || "Unknown"}
        ellipsize={Pango.EllipsizeMode.END}
        halign={START}
        hexpand
      />
      <label label={time(n.time)} class="time" />
    </box>
  );

  // Create a button for each action if they exist
  function actionButtons() {
    const actions = n.get_actions();
    if (!!actions[0])
      return (
        <box class="actions">
          {actions.map(({ label, id }) => (
            <button
              $={pointer}
              label={label}
              hexpand
              onClicked={() => n.invoke(id)}
            />
          ))}
        </box>
      );
  }

  timeout(TIMEOUT_DELAY, () => n.dismiss());
  return (
    <box cssClasses={["notification", urgency(n)]}>
      <Icon />
      <box orientation={VERTICAL}>
        {Header}
        {n.appIcon && makeImage()}
        <label
          class="summary"
          label={n.summary}
          maxWidthChars={36}
          xalign={0}
          wrap
        />
        {n.body && (
          <label
            class="body"
            label={n.body}
            maxWidthChars={36}
            xalign={0}
            wrap
            useMarkup
          />
        )}
        {actionButtons()}
      </box>
    </box>
  ) as Gtk.Box;
};
