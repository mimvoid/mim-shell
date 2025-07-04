import { Astal, Gtk } from "ags/gtk4";
import GObject, { register } from "ags/gobject";
import { pointer } from "@lib/utils";

interface DropdownProps extends Gtk.Revealer.ConstructorProps {
  label: GObject.Object | string;
}

@register({ GTypeName: "Dropdown" })
export default class Dropdown extends Astal.Box {
  constructor({
    child,
    label,
    revealChild = true,
    transitionDuration = 250,
    transitionType = Gtk.RevealerTransitionType.SLIDE_DOWN,
    ...props
  }: Partial<DropdownProps>) {
    super({
      cssClasses: revealChild
        ? ["dropdown", "section", "open"]
        : ["dropdown", "section"],
      vertical: true,
    });

    const Revealer = (
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

    this.set_children([
      (
        <button
          $={pointer}
          onClicked={() => (Revealer.revealChild = !Revealer.revealChild)}
          hexpand
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
      ) as Gtk.Button,
      Revealer,
    ]);
  }
}
