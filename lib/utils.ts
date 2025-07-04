import { Astal, Gtk } from "ags/gtk4";
import { timeout } from "ags/time";
import AstalHyprland from "gi://AstalHyprland";

export function pointer(self: Gtk.Widget) {
  self.set_cursor_from_name("pointer");
}

function popConn(widget: Gtk.Widget) {
  widget.add_css_class("pop");
  timeout(100, () => widget.remove_css_class("pop"));
}
export function popButton(button: Gtk.Button) {
  button.connect("clicked", popConn);
}
export function popMenuButton(mButton: Gtk.MenuButton) {
  mButton.popover.connect("show", (popover) => popConn(popover.parent));
}

export function toPercentage(value: number) {
  return `${Math.trunc(value * 100)}%`;
}
export function drawValuePercentage(w: Gtk.Scale) {
  w.drawValue = true;
  w.valuePos = Gtk.PositionType.RIGHT;
  w.set_format_value_func((_, value) => toPercentage(value));
}

export function stepOnScroll(
  { widget }: Gtk.EventControllerScroll,
  _: number,
  dy: number,
) {
  const slider = widget as Astal.Slider;
  dy < 0 ? (slider.value += slider.step) : (slider.value -= slider.step);
}

export function sendHyprlandBatch(batch: string[]) {
  // Taken from epik-shell
  let cmd = "";

  let snippet: string;
  for (let i = 0, len = batch.length; i < len; i++) {
    snippet = batch[i];
    if (!snippet) continue;

    if (i === 0) {
      cmd += "keyword " + snippet;
    } else {
      cmd += "; keyword " + snippet;
    }
  }

  if (!!cmd) {
    AstalHyprland.get_default().message("[[BATCH]]/" + cmd);
  }
}

export function setLayerrules(namespace: string, rules: string[]) {
  sendHyprlandBatch(
    rules.map((rule) => "layerrule " + rule + ", " + namespace),
  );
}
