import { Astal, Gtk } from "ags/gtk4";
import GObject, { register, getter, setter } from "ags/gobject";
import { pointer } from "@lib/utils";
import { RevealerTransitionType } from "@lib/GObjectTypes";

interface DropdownProps extends Gtk.Revealer.ConstructorProps {
  label: GObject.Object | string;
}

@register({ GTypeName: "Dropdown", Implements: [Gtk.Buildable] })
export default class Dropdown extends Astal.Bin {
  #revealer: Gtk.Revealer;

  constructor({
    child,
    label,
    revealChild = true,
    transitionDuration = 250,
    transitionType = Gtk.RevealerTransitionType.SLIDE_DOWN,
    ...props
  }: Partial<DropdownProps>) {
    super({ cssClasses: revealChild ? ["dropdown", "open"] : ["dropdown"] });

    this.#revealer = (
      <revealer
        revealChild={revealChild}
        transitionDuration={transitionDuration}
        transitionType={transitionType}
        onNotifyRevealChild={({ reveal_child }) =>
          reveal_child
            ? this.add_css_class("open")
            : this.remove_css_class("open")
        }
        {...props}
      >
        {child}
      </revealer>
    ) as Gtk.Revealer;

    this.set_child(
      (
        <box orientation={Gtk.Orientation.VERTICAL}>
          <button
            $={pointer}
            class="dropdown-button"
            hexpand
            onClicked={() =>
              (this.#revealer.revealChild = !this.#revealer.revealChild)
            }
          >
            <box spacing={6}>
              <image iconName="pan-down-symbolic" />
              {label instanceof Gtk.Widget ? (
                label
              ) : (
                <label label={label?.toString()} />
              )}
            </box>
          </button>
          {this.#revealer}
        </box>
      ) as Gtk.Box,
    );

    const realizeId = this.connect("realize", (self) => {
      self.add_css_class("dropdown");
      self.disconnect(realizeId);
    });
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
      this.#revealer.set_child(child);
    } else {
      super.vfunc_add_child(builder, child, type);
    }
  }
}
