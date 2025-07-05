import GObject, { register } from "ags/gobject";
import { Gtk } from "ags/gtk4";
import { timeout } from "ags/time";

interface PopRevealerProps extends Gtk.Popover.ConstructorProps {
  transitionDuration: number;
  transitionType: Gtk.RevealerTransitionType;
}

@register({ GTypeName: "PopRevealer", Implements: [Gtk.Buildable] })
export default class PopRevealer extends Gtk.Popover {
  #revealer: Gtk.Revealer;

  constructor({
    child,
    transitionDuration = 200,
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
    this.#revealer.reveal_child = true;
  }

  vfunc_hide() {
    this.#revealer.reveal_child = false;
    timeout(this.#revealer.transition_duration, () => super.vfunc_hide());
  }
}
