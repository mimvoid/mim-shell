import { createBinding, onCleanup } from "ags";
import { Gtk } from "ags/gtk4";
import Bluetooth from "gi://AstalBluetooth";
import Icon from "@lib/icons";
import { pointer } from "@lib/utils";

function toggleConnect(device: Bluetooth.Device, icon: Gtk.Image) {
  return () => {
    if (device.connecting) return;
    icon.iconName = Icon.waiting;
    const callback = () => (icon.iconName = device.icon);

    device.connected
      ? device.disconnect_device(callback)
      : device.connect_device(callback);
  };
}

function DeviceWidget(device: Bluetooth.Device) {
  const ExtraInfo = (
    <box class="device-info" halign={Gtk.Align.END}>
      {device.paired && (
        <image iconName={Icon.bluetooth.paired} tooltipText="Paired" />
      )}
    </box>
  );
  const DeviceIcon = new Gtk.Image({ iconName: device.icon });

  return (
    <button
      $={pointer}
      class="device"
      tooltipText={createBinding(device, "connected").as(
        (c) => (c ? "Disconnect" : "Connect") + " device",
      )}
      onClicked={toggleConnect(device, DeviceIcon)}
    >
      <box widthRequest={180}>
        {DeviceIcon}
        <label label={device.alias} halign={Gtk.Align.START} hexpand />
        {ExtraInfo}
      </box>
    </button>
  ) as Gtk.Widget;
}

export default () => {
  const { VERTICAL } = Gtk.Orientation;

  const bluetooth = Bluetooth.get_default();
  const isConnected = createBinding(bluetooth, "isConnected");

  const ConnectedBox = (
    <box orientation={VERTICAL} visible={isConnected} />
  ) as Gtk.Box;
  const DisconnectedBox = new Gtk.Box({ orientation: VERTICAL });

  function addWidget(device: Bluetooth.Device) {
    const widget = DeviceWidget(device);
    const parent = device.connected ? ConnectedBox : DisconnectedBox;
    parent.append(widget);

    const connectId = device.connect("notify::connected", (_device) => {
      widget.unparent();
      const newParent = _device.connected ? ConnectedBox : DisconnectedBox;
      newParent.append(widget);
    });
    ConnectedBox.connect("destroy", () => device?.disconnect(connectId));
    DisconnectedBox.connect("destroy", () => device?.disconnect(connectId));

    const removeId = bluetooth.connect("device-removed", (_, _device) => {
      if (_device !== device) return;
      if (widget.get_parent()) widget.unparent();
      widget.run_dispose();
    });
    widget.connect("destroy", () => bluetooth.disconnect(removeId));
  }

  bluetooth.devices.forEach(addWidget);
  const addId = bluetooth.connect("device-added", (_, device) =>
    addWidget(device),
  );
  onCleanup(() => bluetooth.disconnect(addId));

  return { ConnectedBox, DisconnectedBox, isConnected };
};
