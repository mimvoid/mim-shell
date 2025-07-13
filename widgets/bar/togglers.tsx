import app from "ags/gtk4/app";
import Icon from "@lib/icons";

import DashboardPopover from "../popovers/dashboard";
import MediaPopover from "../popovers/media";
import { pointer } from "@lib/utils";

// Toggle mpris media widget menu
export const Media = () => (
  <menubutton $={pointer} class="media-launch" iconName={Icon.mimetypes.audio}>
    <MediaPopover />
  </menubutton>
);

// Toggle the dashboard
export const Dashboard = () => (
  <menubutton $={pointer} class="dashboard-launch" iconName={Icon.overview}>
    <DashboardPopover />
  </menubutton>
);

// Toggle buttons for logging out, shutting down, etc.
export const Session = () => (
  <button
    $={pointer}
    class="session-launch"
    iconName={Icon.powermenu.indicator}
    onClicked={() => app.toggle_window("session")}
  />
);
