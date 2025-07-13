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
  const { START, END } = Gtk.Align;
  const { VERTICAL } = Gtk.Orientation;
  const TIMEOUT_DELAY = 5000;

  function makeImage() {
    if (isIcon(n.image)) {
      return <image class="icon-image" iconName={n.image} />;
    } else if (fileExists(n.image)) {
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
      />
      <label label={time(n.time)} class="time" hexpand halign={END} />
    </box>
  );

  const Content = (
    <box class="content" orientation={VERTICAL}>
      {n.appIcon && makeImage()}
      <label
        label={n.summary}
        class="summary"
        widthChars={36}
        maxWidthChars={36}
        xalign={0}
        wrap
        halign={START}
      />
      {n.body && (
        <label
          label={n.body}
          class="body"
          widthChars={36}
          maxWidthChars={36}
          xalign={0}
          wrap
          useMarkup
          halign={START}
        />
      )}
    </box>
  );

  // Put contents together
  const Main = (
    <box orientation={VERTICAL}>
      {Header}
      {Content}
      {
        // Create a button for each action if they exist
        !!n.get_actions()[0] && (
          <box class="actions">
            {n.get_actions().map(({ label, id }) => (
              <button
                $={pointer}
                label={label}
                onClicked={() => n.invoke(id)}
                hexpand
              />
            ))}
          </box>
        )
      }
    </box>
  );

  timeout(TIMEOUT_DELAY, () => n.dismiss());
  return (
    <box cssClasses={["notification", urgency(n)]}>
      <Icon />
      {Main}
    </box>
  ) as Gtk.Box;
};
