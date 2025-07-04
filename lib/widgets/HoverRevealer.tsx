import GObject, { register } from "ags/gobject";
import { Astal, Gtk } from "ags/gtk4";

interface HoverRevealerProps extends Gtk.Revealer.ConstructorProps {
  hiddenChild: GObject.Object;
}

@register({ GTypeName: "HoverRevealer", Implements: [Gtk.Buildable] })
export default class HoverRevealer extends Astal.Box {
  #revealer: Gtk.Revealer;

  constructor({
    hiddenChild,
    child,
    transitionDuration = 250,
    transitionType = Gtk.RevealerTransitionType.SLIDE_RIGHT,
    ...props
  }: Partial<HoverRevealerProps>) {
    super({ cssClasses: ["hover-revealer"] });
    this.set_cursor_from_name("pointer");

    this.#revealer = (
      <revealer
        $={(self) => self.get_child()?.add_css_class("hidden-child")}
        transitionDuration={transitionDuration}
        transitionType={transitionType}
        {...props}
      >
        {hiddenChild}
      </revealer>
    ) as Gtk.Revealer;

    this.append(this.#revealer);
    if (child) this.append(child);

    const hover = new Gtk.EventControllerMotion();
    this.add_controller(hover);
    hover.connect("enter", () => (this.#revealer.reveal_child = true));
    hover.connect("leave", () => (this.#revealer.reveal_child = false));
  }

  set_hidden_child(child: Gtk.Widget | null) {
    this.#revealer.set_child(child);
  }

  vfunc_add_child(
    builder: Gtk.Builder,
    child: GObject.Object,
    type?: string | null,
  ) {
    if (child instanceof Gtk.Widget) {
      if (type && type === "hidden" && !this.#revealer.get_child()) {
        this.set_hidden_child(child);
      } else {
        this.append(child);
      }
    } else {
      super.vfunc_add_child(builder, child, type);
    }
  }
}
