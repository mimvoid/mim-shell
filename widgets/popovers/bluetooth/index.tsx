import { execAsync, bind } from "astal";
import { Gtk, hook } from "astal/gtk4";
import Bluetooth from "gi://AstalBluetooth";

import Icon from "@lib/icons";
import PopRevealer from "@lib/widgets/PopRevealer";
import { pointer, popButton } from "@lib/utils";
import { connectedDevices, disconnectedDevices } from "./DeviceItem";

const bluetooth = Bluetooth.get_default();
const { START, CENTER } = Gtk.Align;

function Status() {
  const action = () =>
    execAsync(`bluetooth ${bluetooth.isPowered ? "off" : "on"}`);

  // Display icon depending on Bluetooth status
  const icon = bind(bluetooth, "isPowered").as(
    (p) => Icon.bluetooth[p ? "enabled" : "disabled"],
  );

  function powerHook(button: Gtk.Button) {
    if (bluetooth.isPowered) {
      button.tooltipText = "Turn off Bluetooth";
      button.remove_css_class("off");
    } else {
      button.tooltipText = "Turn on Bluetooth";
      button.add_css_class("off");
    }
  }

  return (
    <box cssClasses={["status", "section"]}>
      <button
        setup={(self) => {
          pointer(self);
          popButton(self);

          powerHook(self);
          hook(self, bluetooth, "notify::is-powered", powerHook);
        }}
        cssClasses={["big-toggle"]}
        onClicked={action}
      >
        <image iconName={icon} iconSize={Gtk.IconSize.LARGE} />
      </button>
      <box valign={CENTER} vertical>
        <label
          label={bind(bluetooth, "adapter").as((a) => a.name)}
          halign={START}
        />
        <label
          label={bind(bluetooth, "isPowered").as((p) => (p ? "On" : "Off"))}
          halign={START}
        />
      </box>
    </box>
  );
}

function Connected() {
  const DefaultLabel = <label label="None connected" halign={START} />;

  return (
    <box
      cssClasses={["section", "connected"]}
      vertical
      onDestroy={() => connectedDevices.drop()}
    >
      <label cssClasses={["title"]} label="Connected" halign={START} />
      {bind(connectedDevices).as((d) =>
        d[0] ? <box vertical>{d}</box> : DefaultLabel,
      )}
    </box>
  );
}

const Disconnected = (
  <box
    cssClasses={["section", "disconnected"]}
    vertical
    onDestroy={() => disconnectedDevices.drop()}
  >
    <label cssClasses={["title"]} label="Disconnected" halign={START} />
    <box vertical>{disconnectedDevices()}</box>
  </box>
);

export default (
  <PopRevealer cssClasses={["bluetooth-popover"]} hasArrow={false}>
    <box vertical>
      <Status />
      <Connected />
      {Disconnected}
    </box>
  </PopRevealer>
);
