import { createBinding } from "ags";
import Battery from "gi://AstalBattery";
import { toPercentage } from "@lib/utils";

export default () => {
  const battery = Battery.get_default();

  return (
    <box
      class="battery icon-label"
      tooltipText={createBinding(battery, "charging").as((c) =>
        c ? "Charging" : "Discharging",
      )}
      visible={battery.isPresent}
    >
      <image iconName={createBinding(battery, "batteryIconName")} />
      <label label={createBinding(battery, "percentage").as(toPercentage)} />
    </box>
  );
};
