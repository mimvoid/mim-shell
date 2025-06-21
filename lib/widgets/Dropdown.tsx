import { Astal, Widget, Gtk } from "astal/gtk4";
import GObject from "astal/gobject";

interface DropdownProps extends Widget.RevealerProps {
  label: Gtk.Widget;
}

export default class Dropdown extends Astal.Box {
  static {
    GObject.registerClass({ GTypeName: "Dropdown" }, this);
  }

  constructor({
    child,
    label,
    revealChild = true,
    transitionDuration = 250,
    transitionType = Gtk.RevealerTransitionType.SLIDE_DOWN,
    ...props
  }: DropdownProps) {
    super({
      cssClasses: ["dropdown", "section", revealChild ? "open" : "closed"],
      vertical: true,
    });

    const Revealer = (
      <revealer
        revealChild={revealChild}
        transitionDuration={transitionDuration}
        transitionType={transitionType}
        child={child}
        {...props}
      />
    ) as Gtk.Revealer;

    Revealer.connect("notify::reveal-child", ({ reveal_child }) => {
      if (reveal_child) {
        this.remove_css_class("closed");
        this.add_css_class("open");
      } else {
        this.remove_css_class("open");
        this.add_css_class("closed");
      }
    });

    this.children = [
      <button
        setup={(self) => self.set_cursor_from_name("pointer")}
        onClicked={() => (Revealer.revealChild = !Revealer.revealChild)}
        hexpand
        child={
          <box spacing={6}>
            <image iconName="pan-down-symbolic" />
            {label}
          </box>
        }
      />,
      Revealer,
    ];
  }
}
