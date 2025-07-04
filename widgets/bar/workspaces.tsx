import { For, createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import Hyprland from "gi://AstalHyprland";

export default () => {
  const hypr = Hyprland.get_default();

  const workspaces = createBinding(hypr, "workspaces").as((wss) =>
    wss.sort((a, b) => a.id - b.id),
  );
  const focusedId = createBinding(hypr, "focusedWorkspace").as((ws) => ws.id);

  function updateActive(self: Gtk.Button, id: number) {
    focusedId.get() === id
      ? self.add_css_class("active")
      : self.remove_css_class("active");
  }

  return (
    <box class="workspaces" spacing={4}>
      <For each={workspaces}>
        {(ws) => (
          <button
            $={(self) => {
              if (focusedId.get() === ws.id) self.add_css_class("active");
              focusedId.subscribe(() => updateActive(self, ws.id));
            }}
            onClicked={() => ws.focus()}
            tooltipText={`Workspace ${ws.id}`}
          />
        )}
      </For>
    </box>
  );
};
