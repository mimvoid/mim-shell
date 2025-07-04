// Defines an individual notification widget

import { pointer } from "@lib/utils";
import { Gtk, Gdk } from "ags/gtk4";
import Notifd from "gi://AstalNotifd";
import GLib from "gi://GLib?version=2.0";
import Pango from "gi://Pango";

const { START, CENTER, END } = Gtk.Align;
const { VERTICAL } = Gtk.Orientation;

function isIcon(icon: string | null) {
  if (!icon) return false;

  const iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!);
  return iconTheme.has_icon(icon);
}

function fileExists(path: string) {
  return GLib.file_test(path, GLib.FileTest.EXISTS);
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

type Props = {
  notification: Notifd.Notification;
  onHoverLeave(source: Gtk.EventControllerMotion): void;
  setup(self: Gtk.Box): void;
};

export default ({ notification: n, onHoverLeave, setup }: Props) => {
  const Icon = (
    <image
      class="app-icon"
      iconName={n.appIcon || n.desktopEntry || "dialog-information-symbolic"}
    />
  );

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

  function Content() {
    function mkImage(image: string) {
      if (fileExists(image)) {
        return <image class="image" valign={START} file={n.image} />;
      }
      if (isIcon(image)) {
        return (
          <image
            class="icon-image"
            iconName={n.image}
            hexpand
            vexpand
            halign={CENTER}
            valign={CENTER}
          />
        );
      }
    }

    return (
      <box class="content" orientation={VERTICAL}>
        {n.image && mkImage(n.image)}
        <label
          label={n.summary}
          class="summary"
          halign={START}
          xalign={0}
          wrap
        />
        {n.body && (
          <label
            label={n.body}
            class="body"
            wrap
            maxWidthChars={36}
            useMarkup
            halign={START}
          />
        )}
      </box>
    );
  }

  // Put contents together
  const Main = (
    <box orientation={VERTICAL}>
      {Header}
      <Content />
      {
        // Create a button for each action if they exist
        !!n.get_actions()[0] && (
          <box class="actions">
            {n.get_actions().map(({ label, id }) => (
              <button $={pointer} onClicked={() => n.invoke(id)} hexpand>
                <label label={label} halign={CENTER} hexpand />
              </button>
            ))}
          </box>
        )
      }
    </box>
  );

  // Put everything together
  const NotifBox = (
    <box class="notification">
      {Icon}
      {Main}
    </box>
  );

  // Handle urgency & events
  return (
    <box $={setup} class={urgency(n)}>
      <Gtk.EventControllerMotion onLeave={onHoverLeave} />
      {NotifBox}
    </box>
  );
};
