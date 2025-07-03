import { execAsync } from "astal";
import { Gtk, hook } from "astal/gtk4";
import Bluetooth from "gi://AstalBluetooth";

import BluetoothPopover from "../popovers/bluetooth";
import HoverRevealer from "@lib/widgets/HoverRevealer";
import Icon from "@lib/icons";

const bluetooth = Bluetooth.get_default();

// Show the Bluetooth status
const Indicator = (
  <button
    setup={(self) => {
      self.set_cursor_from_name("pointer");

      function poweredHook(button: Gtk.Button) {
        if (bluetooth.isPowered) {
          button.tooltipText = "Bluetooth on";
          button.iconName = Icon.bluetooth.enabled;
        } else {
          button.tooltipText = "Bluetooth off";
          button.iconName = Icon.bluetooth.disabled;
        }
      }

      poweredHook(self);
      hook(self, bluetooth, "notify::is-powered", poweredHook);
    }}
    onClicked={() =>
      execAsync(`bluetooth ${bluetooth.isPowered ? "off" : "on"}`)
    }
  />
);

function BluetoothBox() {
  // Show first connected device name
  function connectHook(label: Gtk.Label) {
    if (!bluetooth.is_connected) {
      label.label = "None connected";
    } else {
      const firstConnected = bluetooth.devices.find((d) => d.connected)!;
      label.label = firstConnected.alias;
    }
  }

  const DeviceName = (
    <label
      setup={(self) => {
        connectHook(self);
        hook(self, bluetooth, "notify::is-connected", connectHook);
      }}
    />
  );

  return (
    <menubutton>
      <HoverRevealer hiddenChild={DeviceName}>{Indicator}</HoverRevealer>
      {BluetoothPopover}
    </menubutton>
  );
}

export default () => (
  <box cssClasses={["bluetooth"]}>
    <BluetoothBox />
  </box>
);
