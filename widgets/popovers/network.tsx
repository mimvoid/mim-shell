import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import Network from "gi://AstalNetwork";
import PopRevealer from "@lib/widgets/PopRevealer";
import { pointer, popButton } from "@lib/utils";

const network = Network.get_default();
const wifi = network.wifi;

const { START, CENTER } = Gtk.Align;
const { VERTICAL } = Gtk.Orientation;

function Current() {
  const enabled = createBinding(wifi, "enabled");
  const icon = createBinding(wifi, "iconName");
  const ssid = createBinding(wifi, "ssid");
  const strength = createBinding(wifi, "strength").as((s) => `${s}%`);

  return (
    <box cssClasses={["section", "current"]}>
      <button
        $={(self) => {
          pointer(self);
          popButton(self);

          enabled.subscribe(() =>
            enabled.get()
              ? self.remove_css_class("off")
              : self.add_css_class("off"),
          );
        }}
        class="big-toggle"
        tooltipText={enabled((e) => `Turn ${e ? "off" : "on"} wifi`)}
        onClicked={() => (wifi.enabled = !wifi.enabled)}
      >
        <image iconName={icon} iconSize={Gtk.IconSize.LARGE} />
      </button>
      <box valign={CENTER} orientation={VERTICAL}>
        <label label={ssid} halign={START} />
        <label label={strength} halign={START} />
      </box>
    </box>
  );
}

export default () => (
  <PopRevealer class="network-popover" hasArrow={false}>
    <box orientation={VERTICAL}>
      <Current />
    </box>
  </PopRevealer>
) as Gtk.Popover;
