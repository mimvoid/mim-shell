import { createBinding, For } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import Network from "gi://AstalNetwork";

import PopRevealer from "@lib/widgets/PopRevealer";
import { pointer, popButton } from "@lib/utils";
import Icons from "@lib/icons";

function setupButton(btn: Gtk.Button) {
  pointer(btn);
  popButton(btn);
}

async function connect(ap: Network.AccessPoint) {
  try {
    await execAsync("nmcli device wifi connect " + ap.bssid);
  } catch (err) {
    console.error(err);
  }
}

function processAPs(aps: Network.AccessPoint[], wifi: Network.Wifi) {
  // Filter for unique ssids
  return aps
    .filter(
      (ap, index, arr) =>
        !!ap.ssid &&
        ap !== wifi.activeAccessPoint &&
        arr.findIndex((a) => a.ssid === ap.ssid) === index,
    )
    .sort((a, b) => b.strength - a.strength);
}

export default () => {
  const { START, CENTER, END, FILL } = Gtk.Align;
  const { VERTICAL } = Gtk.Orientation;

  const network = Network.get_default();
  const wifi = network.wifi;
  const enabled = createBinding(wifi, "enabled");

  function Current() {
    const icon = createBinding(wifi, "iconName");
    const strength = createBinding(wifi, "strength").as((s) => `${s}%`);

    return (
      <box class="section current">
        <togglebutton
          $={setupButton}
          class="big-toggle"
          active={enabled}
          tooltipText={enabled((e) => `Turn ${e ? "off" : "on"} wifi`)}
          onClicked={() => execAsync("rfkill toggle wifi")}
        >
          <image iconName={icon} iconSize={Gtk.IconSize.LARGE} />
        </togglebutton>
        <box valign={CENTER} orientation={VERTICAL}>
          <label label={createBinding(wifi, "ssid")} halign={START} />
          <label label={strength} halign={START} />
        </box>
      </box>
    );
  }

  function AccessPoints() {
    const ScanButton = (
      <button
        $={setupButton}
        class="scan-button"
        iconName={Icons.refresh}
        halign={END}
        valign={CENTER}
        onClicked={(self) => {
          wifi.scan();
          self.iconName = Icons.waiting;

          const scanningId = wifi.connect("notify::scanning", (_wifi) => {
            if (!_wifi.scanning) {
              self.iconName = Icons.refresh;
              _wifi.disconnect(scanningId);
            }
          });
        }}
      />
    );

    const aps = createBinding(wifi, "accessPoints").as((a) =>
      processAPs(a, wifi),
    );

    return (
      <box class="section access-points" orientation={VERTICAL}>
        <box hexpand>
          <label class="title" label="Networks" halign={START} hexpand />
          {ScanButton}
        </box>
        <For each={aps}>
          {(ap) => (
            <button
              $={setupButton}
              halign={FILL}
              tooltipText={createBinding(ap, "strength").as((s) => `${s}%`)}
              onClicked={() => connect(ap)}
            >
              <box>
                <image iconName={createBinding(ap, "iconName")} />
                <label label={ap.ssid} halign={START} hexpand />
                {ap.requiresPassword && (
                  <image class="lock" iconName={Icons.lock} />
                )}
              </box>
            </button>
          )}
        </For>
      </box>
    );
  }

  return (
    <PopRevealer class="network-popover" hasArrow={false}>
      <box orientation={VERTICAL}>
        <Current />
        <AccessPoints />
      </box>
    </PopRevealer>
  ) as Gtk.Popover;
};
