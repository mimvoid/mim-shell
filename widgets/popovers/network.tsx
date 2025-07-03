import { bind } from "astal";
import { Gtk, hook } from "astal/gtk4";
import Network from "gi://AstalNetwork";
import PopRevealer from "@lib/widgets/PopRevealer";
import { pointer, popButton } from "@lib/utils";

const network = Network.get_default();
const wifi = network.wifi;

const { START, CENTER } = Gtk.Align;

const Current = (
  <box cssClasses={["section", "current"]}>
    <button
      setup={(self) => {
        pointer(self);
        popButton(self);

        function enabledHook(button: Gtk.Button) {
          const e = wifi.enabled;
          button.tooltipText = `Turn ${wifi.enabled ? "off" : "on"} wifi`;
          e ? button.remove_css_class("off") : button.add_css_class("off");
        }

        enabledHook(self);
        hook(self, wifi, "notify::enabled", enabledHook);
      }}
      cssClasses={["big-toggle"]}
      onClicked={() => (wifi.enabled = !wifi.enabled)}
    >
      <image iconName={bind(wifi, "iconName")} iconSize={Gtk.IconSize.LARGE} />
    </button>
    <box valign={CENTER} vertical>
      <label label={bind(wifi, "ssid")} halign={START} />
      <label label={bind(wifi, "strength").as((i) => `${i}%`)} halign={START} />
    </box>
  </box>
);

export default (
  <PopRevealer cssClasses={["network-popover"]} hasArrow={false}>
    <box vertical>{Current}</box>
  </PopRevealer>
) as Gtk.Popover;
