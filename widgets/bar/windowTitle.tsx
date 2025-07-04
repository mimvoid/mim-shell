import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import Hyprland from "gi://AstalHyprland";
import Pango from "gi://Pango";

export default () => {
  const hypr = Hyprland.get_default();
  const focusedClient = createBinding(hypr, "focusedClient");

  function updateClient(self: Gtk.Label) {
    const client = focusedClient.get();
    self.visible = !!client;
    if (!self.visible) return;

    const title = client.title;
    self.label = title;
    self.tooltipText = title;
  }

  return (
    <label
      $={(self) => {
        updateClient(self);
        focusedClient.subscribe(() => updateClient(self));
      }}
      class="window-title"
      ellipsize={Pango.EllipsizeMode.END}
      maxWidthChars={42}
    />
  );
};
