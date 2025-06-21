import { Binding, timeout } from "astal";
import { Widget, Gtk } from "astal/gtk4";
import GObject from "astal/gobject";

interface PopRevealerProps extends Widget.PopoverProps {
  transitionDuration?: number | Binding<number>;
  transitionType?: Gtk.RevealerTransitionType;
}

export default class PopRevealer extends Gtk.Popover {
  static {
    GObject.registerClass({ GTypeName: "PopRevealer" }, this);
  }

  #revealer: Gtk.Revealer;

  constructor({
    child,
    transitionDuration = 200,
    transitionType = Gtk.RevealerTransitionType.SLIDE_DOWN,
    ...props
  }: PopRevealerProps) {
    super({ ...props });

    this.#revealer = (
      <revealer
        transitionDuration={transitionDuration}
        transitionType={transitionType}
        child={child}
      />
    ) as Gtk.Revealer;
    this.child = this.#revealer;
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
