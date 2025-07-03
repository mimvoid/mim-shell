import { Variable } from "astal";
import { Gtk, hook } from "astal/gtk4";
import Bluetooth from "gi://AstalBluetooth";
import Icon from "@lib/icons";

export const connectedDevices: Variable<Gtk.Widget[]> = Variable([]);
export const disconnectedDevices: Variable<Gtk.Widget[]> = Variable([]);

function connectHook({ connected }: Bluetooth.Device, button: Gtk.Button) {
  button.tooltipText = `${connected ? "Disconnect" : "Connect"} device`;

  const toAddTo = connected ? connectedDevices : disconnectedDevices;
  const devices = toAddTo.get();
  devices.push(button);
  toAddTo.set(devices);
}

const bluetooth = Bluetooth.get_default();
bluetooth.get_devices().map((device) => {
  const DeviceInfo = (
    <box
      cssClasses={["device-info"]}
      halign={Gtk.Align.END}
      children={
        device.paired
          ? [<image iconName={Icon.bluetooth.paired} tooltipText="Paired" />]
          : []
      }
    />
  ) as Gtk.Box;

  const DeviceIcon = new Gtk.Image({ iconName: device.icon });

  return (
    <button
      setup={(self) => {
        self.set_cursor_from_name("pointer");
        connectHook(device, self);

        hook(self, device, "notify::connected", (button) => {
          connectHook(device, button);

          const toRemoveFrom = device.connected
            ? disconnectedDevices
            : connectedDevices;
          toRemoveFrom.set(toRemoveFrom.get().filter((d) => d !== button));
        });
      }}
      cssClasses={["device"]}
      onClicked={() => {
        if (device.connecting) return;

        DeviceIcon.iconName = Icon.waiting;
        const callback = () => (DeviceIcon.iconName = device.icon);

        device.connected
          ? device.disconnect_device(callback)
          : device.connect_device(callback);
      }}
    >
      <box widthRequest={180}>
        {DeviceIcon}
        <label label={device.alias} halign={Gtk.Align.START} hexpand />
        {DeviceInfo}
      </box>
    </button>
  );
});
