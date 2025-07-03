import { Gtk, hook } from "astal/gtk4";
import Hyprland from "gi://AstalHyprland";
import Pango from "gi://Pango";

export default () => {
  const hypr = Hyprland.get_default();

  function hookClient(lab: Gtk.Label) {
    lab.visible = !!hypr.focusedClient;
    if (!lab.visible) return;

    lab.label = hypr.focusedClient.title;
    lab.tooltipText = hypr.focusedClient.title;
  }

  return (
    <label
      setup={(self) => {
        hookClient(self);
        hook(self, hypr, "notify::focused-client", hookClient);
      }}
      cssClasses={["window-title"]}
      ellipsize={Pango.EllipsizeMode.END}
      maxWidthChars={42}
    />
  );
};
