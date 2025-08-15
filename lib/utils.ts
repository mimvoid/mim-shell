import { Astal, Gtk } from "ags/gtk4";
import { timeout } from "ags/time";
import AstalHyprland from "gi://AstalHyprland";

export function pointer(self: Gtk.Widget) {
  self.set_cursor_from_name("pointer");
}

function animatePop(widget: Gtk.Widget) {
  widget.add_css_class("pop");
  timeout(100, () => widget.remove_css_class("pop"));
}
export function popButton(button: Gtk.Button) {
  button.connect("clicked", animatePop);
}
export function popMenuButton(menuButton: Gtk.MenuButton) {
  menuButton.popover.connect("show", (popover) => {
    animatePop(popover.parent);
  });
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
  const valueChange = dy < 0 ? slider.step : -slider.step;
  slider.value += valueChange;
}

export function sendHyprlandBatch(batch: string[]) {
  const len = batch.length;
  if (len === 0) return;

  let cmd = "[[BATCH]]/";

  let keyword: string;
  for (let i = 0; i < len; i++) {
    keyword = batch[i];
    if (keyword === "") continue;

    if (i === 0) {
      cmd += "keyword " + keyword;
    } else {
      cmd += "; keyword " + keyword;
    }
  }

  AstalHyprland.get_default().message(cmd);
}

export function setLayerrules(namespace: string, rules: string[]) {
  sendHyprlandBatch(
    rules.map((rule) => "layerrule " + rule + ", " + namespace),
  );
}
