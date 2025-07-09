import GObject, { register, getter, setter } from "ags/gobject";
import { Gtk } from "ags/gtk4";
import { interval, timeout } from "ags/time";
import { UInt, RevealerTransitionType } from "@lib/GObjectTypes";

interface PopRevealerProps extends Gtk.Popover.ConstructorProps {
  transitionDuration: number;
  transitionType: Gtk.RevealerTransitionType;
}

@register({ GTypeName: "PopRevealer", Implements: [Gtk.Buildable] })
export default class PopRevealer extends Gtk.Popover {
  #revealer: Gtk.Revealer;

  constructor({
    child,
    transitionDuration = 180,
    transitionType = Gtk.RevealerTransitionType.SLIDE_DOWN,
    ...props
  }: Partial<PopRevealerProps>) {
    super({ ...props });

    this.#revealer = (
      <revealer
        transitionDuration={transitionDuration}
        transitionType={transitionType}
      >
        {child}
      </revealer>
    ) as Gtk.Revealer;

    this.set_child(this.#revealer);
  }

  @getter(UInt)
  get transitionDuration() {
    return this.#revealer.transitionDuration;
  }
  @setter(UInt)
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
      this.#revealer.set_child(child);
    } else {
      super.vfunc_add_child(builder, child, type);
    }
  }

  vfunc_show() {
    super.vfunc_show();

    // Handle animation
    this.#revealer.reveal_child = true;

    let offset = 0;
    const overshoot = interval(30, () => this.set_offset(0, ++offset));

    timeout(this.#revealer.transition_duration, () => {
      overshoot.cancel();

      const snapBack = interval(10, () => {
        this.set_offset(0, --offset);
        if (offset === 0) {
          snapBack.cancel();
        }
      })
    });
  }

  vfunc_hide() {
    this.#revealer.reveal_child = false;
    timeout(this.#revealer.transition_duration, () => super.vfunc_hide());
  }
}
