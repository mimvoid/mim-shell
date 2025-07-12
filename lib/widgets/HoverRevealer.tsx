import GObject, { register, getter, setter } from "ags/gobject";
import { Astal, Gtk } from "ags/gtk4";
import { RevealerTransitionType } from "@lib/GObjectTypes";

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
    super();
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

    const realizeId = this.connect("realize", () => {
      this.add_css_class("hover-revealer");
      this.disconnect(realizeId);
    })
  }

  @getter(Gtk.Widget)
  get hiddenChild() {
    return this.#revealer.child;
  }
  @setter(Gtk.Widget)
  set hiddenChild(hiddenChild) {
    this.#revealer.child = hiddenChild;
    this.notify("hidden-child");
  }

  @getter({ $gtype: GObject.TYPE_UINT })
  get transitionDuration() {
    return this.#revealer.transitionDuration;
  }
  @setter({ $gtype: GObject.TYPE_UINT })
  set transitionDuration(duration) {
    this.#revealer.transitionDuration = duration;
    this.notify("transition-duration");
  }

  @getter(RevealerTransitionType)
  get transitionType() {
    return this.#revealer.transitionType;
  }
  @setter(RevealerTransitionType)
  set transitionType(transitionType) {
    this.#revealer.transitionType = transitionType;
    this.notify("transition-type");
  }

  vfunc_add_child(
    builder: Gtk.Builder,
    child: GObject.Object,
    type?: string | null,
  ) {
    if (child instanceof Gtk.Widget) {
      if (type && type === "hidden" && !this.#revealer.get_child()) {
        this.hiddenChild = child;
      } else {
        this.append(child);
      }
    } else {
      super.vfunc_add_child(builder, child, type);
    }
  }
}
