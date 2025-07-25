import { createBinding } from "ags";
import Bluetooth from "gi://AstalBluetooth";

import BluetoothPopover from "../popovers/bluetooth";
import HoverRevealer from "@lib/widgets/HoverRevealer";
import Icon from "@lib/icons";

const bluetooth = Bluetooth.get_default();

// Show the Bluetooth status
function Indicator() {
  const state = createBinding(bluetooth, "isPowered").as((p) =>
    p ? "on" : "off",
  );

  return (
    <image
      iconName={state((s) => Icon.bluetooth[s])}
      tooltipText={state((s) => "Bluetooth " + s)}
    />
  );
}

export default () => {
  // Show first connected device name
  const DeviceName = (
    <label
      label={createBinding(bluetooth, "isConnected").as((c) => {
        if (c) {
          const firstConnected = bluetooth.devices.find((d) => d.connected);
          if (firstConnected) return firstConnected.alias;
        }
        return "None connected";
      })}
    />
  );

  return (
    <menubutton class="bluetooth">
      <HoverRevealer hiddenChild={DeviceName}>
        <Indicator />
      </HoverRevealer>
      <BluetoothPopover />
    </menubutton>
  );
};
