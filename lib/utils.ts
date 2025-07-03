import { timeout } from "astal";
import { Astal, Gtk, hook } from "astal/gtk4";
import AstalHyprland from "gi://AstalHyprland";

export function pointer(self: Gtk.Widget) {
  self.set_cursor_from_name("pointer");
}

function popHook(button: Gtk.Button) {
  button.add_css_class("pop");
  timeout(100, () => button.remove_css_class("pop"));
}
export function popButton(self: Gtk.Button) {
  hook(self, self, "clicked", popHook);
}

function popMenuHook(mButton: Gtk.MenuButton) {
  mButton.add_css_class("pop");
  timeout(100, () => mButton.remove_css_class("pop"));
}
export function popMenuButton(self: Gtk.MenuButton, popover: Gtk.Popover) {
  hook(self, popover, "show", popMenuHook);
}

export function drawValuePercentage(w: Gtk.Scale) {
  w.drawValue = true;
  w.valuePos = Gtk.PositionType.RIGHT;
  w.set_format_value_func((_, value) => `${Math.trunc(value * 100)}%`);
}

export function stepOnScroll(slider: Astal.Slider, _: number, dy: number) {
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
