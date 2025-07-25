import { createBinding } from "ags";
import Network from "gi://AstalNetwork";

import HoverRevealer from "@lib/widgets/HoverRevealer";
import { pointer } from "@lib/utils";
import NetworkPopover from "../popovers/network";

export default () => {
  const network = Network.get_default();

  const Icon = (
    <image
      $={pointer}
      tooltipText={createBinding(network.wifi, "strength").as((i) => `${i}%`)}
      iconName={createBinding(network.wifi, "iconName")}
    />
  );

  const Label = <label label={createBinding(network.wifi, "ssid")} />;

  return (
    <menubutton class="network">
      <HoverRevealer hiddenChild={Label}>{Icon}</HoverRevealer>
      <NetworkPopover />
    </menubutton>
  );
};
