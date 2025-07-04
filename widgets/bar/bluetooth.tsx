import { createBinding } from "ags";
import { execAsync } from "ags/process";
import Bluetooth from "gi://AstalBluetooth";

import BluetoothPopover from "../popovers/bluetooth";
import HoverRevealer from "@lib/widgets/HoverRevealer";
import Icon from "@lib/icons";
import { pointer } from "@lib/utils";

const bluetooth = Bluetooth.get_default();

// Show the Bluetooth status
function Indicator() {
  const state = createBinding(bluetooth, "isPowered").as((p) =>
    p ? "on" : "off",
  );

  return (
    <button
      $={pointer}
      tooltipText={state((s) => "Bluetooth " + s)}
      iconName={state((s) => Icon.bluetooth[s])}
      onClicked={() =>
        execAsync("bluetooth " + (bluetooth.isPowered ? "off" : "on"))
      }
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
    <box class="bluetooth">
      <menubutton>
        <HoverRevealer hiddenChild={DeviceName}>
          <Indicator />
        </HoverRevealer>
        <BluetoothPopover />
      </menubutton>
    </box>
  );
};
