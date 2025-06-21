import { Widget, Gtk } from "astal/gtk4";

interface HoverRevealerProps extends Widget.RevealerProps {
  hiddenChild: Gtk.Widget;
}

export default ({
  hiddenChild,
  child,
  transitionDuration = 250,
  transitionType = Gtk.RevealerTransitionType.SLIDE_RIGHT,
  ...props
}: HoverRevealerProps): Gtk.Widget => {
  hiddenChild.add_css_class("hidden-child");

  const Revealer = (
    <revealer
      transitionDuration={transitionDuration}
      transitionType={transitionType}
      child={hiddenChild}
      {...props}
    />
  ) as Gtk.Revealer;

  return (
    <box
      setup={(self) => self.set_cursor_from_name("pointer")}
      cssClasses={["hover-revealer"]}
      onHoverEnter={() => (Revealer.revealChild = true)}
      onHoverLeave={() => (Revealer.revealChild = false)}
    >
      {Revealer}
      {child}
    </box>
  );
};
