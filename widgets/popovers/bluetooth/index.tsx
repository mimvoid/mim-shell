import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import Bluetooth from "gi://AstalBluetooth";

import Icon from "@lib/icons";
import PopRevealer from "@lib/widgets/PopRevealer";
import { pointer, popButton } from "@lib/utils";
import Devices from "./Devices";

const { START, CENTER } = Gtk.Align;
const { VERTICAL } = Gtk.Orientation;

function Status() {
  const bluetooth = Bluetooth.get_default();
  const onClicked = () => execAsync("rfkill toggle bluetooth");
  const powered = createBinding(bluetooth, "isPowered");

  return (
    <box class="status section">
      <button
        $={(self) => {
          pointer(self);
          popButton(self);
          powered.subscribe(() =>
            powered.get()
              ? self.remove_css_class("off")
              : self.add_css_class("off"),
          );
        }}
        class={bluetooth.isPowered ? "big-toggle" : "big-toggle off"}
        tooltipText={powered((p) =>
          p ? "Turn off Bluetooth" : "Turn on Bluetooth",
        )}
        onClicked={onClicked}
      >
        <image
          iconName={powered((p) => Icon.bluetooth[p ? "on" : "off"])}
          iconSize={Gtk.IconSize.LARGE}
        />
      </button>
      <box valign={CENTER} orientation={VERTICAL}>
        <label
          label={createBinding(bluetooth, "adapter").as((a) => a.name)}
          halign={START}
        />
        <label label={powered((p) => (p ? "On" : "Off"))} halign={START} />
      </box>
    </box>
  );
}

export default () => {
  const { ConnectedBox, DisconnectedBox, isConnected } = Devices();

  const Connected = (
    <box class="section connected" orientation={VERTICAL}>
      <label class="title" label="Connected" halign={START} />
      {ConnectedBox}
      <label
        label="None connected"
        halign={START}
        visible={isConnected((c) => !c)}
      />
    </box>
  );

  const Disconnected = (
    <box class="section disconnected" orientation={VERTICAL}>
      <label class="title" label="Disconnected" halign={START} />
      {DisconnectedBox}
    </box>
  );

  return (
    <PopRevealer class="bluetooth-popover" hasArrow={false}>
      <box orientation={VERTICAL}>
        <Status />
        {Connected}
        {Disconnected}
      </box>
    </PopRevealer>
  );
};
