import { bind } from "astal";
import Battery from "gi://AstalBattery";

const battery = Battery.get_default();

export default () => (
  <box
    setup={(self) => {
      if (!battery.isPresent) return;

      self.children = [
        <image iconName={bind(battery, "batteryIconName")} />,
        <label
          label={bind(battery, "percentage").as(
            (p) => `${Math.trunc(p * 100)}%`,
          )}
        />,
      ];
    }}
    cssClasses={["battery", "icon-label"]}
    tooltipText={bind(battery, "charging").as((c) =>
      c ? "Charging" : "Discharging",
    )}
    visible={battery.isPresent}
  />
);
