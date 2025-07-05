import { Accessor, createBinding, createState } from "ags";
import { Gtk } from "ags/gtk4";
import Bluetooth from "gi://AstalBluetooth";
import Icon from "@lib/icons";
import { pointer } from "@lib/utils";

export default () => {
  const [connDevices, setConnDevices] = createState(Array<Gtk.Widget>());
  const [disDevices, setDisDevices] = createState(Array<Gtk.Widget>());

  function addWidget(button: Gtk.Button, isConnected: boolean) {
    const addTo = isConnected ? setConnDevices : setDisDevices;
    addTo((prev) => [...prev, button]);
  }

  function removeWidget(button: Gtk.Button, isConnected: boolean) {
    const removeFrom = isConnected ? setDisDevices : setConnDevices;
    removeFrom((prev) => prev.filter((btn) => btn !== button));
  }

  const bluetooth = Bluetooth.get_default();
  bluetooth.get_devices().map((device) => {
    const connected = createBinding(device, "connected");

    const DeviceInfo = (
      <box class="device-info" halign={Gtk.Align.END}>
        {device.paired && (
          <image iconName={Icon.bluetooth.paired} tooltipText="Paired" />
        )}
      </box>
    );

    const DeviceIcon = new Gtk.Image({ iconName: device.icon });

    return (
      <button
        $={(self) => {
          pointer(self);
          addWidget(self, device.connected);

          connected.subscribe(() => {
            addWidget(self, connected.get());
            removeWidget(self, connected.get());
          });
        }}
        class="device"
        tooltipText={connected(
          (c) => (c ? "Disconnect" : "Connect") + " device",
        )}
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

  return [connDevices, disDevices];
};
