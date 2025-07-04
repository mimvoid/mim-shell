import { Gtk } from "ags/gtk4";
import Icon from "@lib/icons";
import { pollTime } from "@lib/variables";
import { pointer } from "@lib/utils";
import Calendar from "../popovers/calendar";

export default () => (
  <menubutton $={pointer}>
    <box class="clock" halign={Gtk.Align.CENTER}>
      <image iconName={Icon.calendar} />
      <label label={pollTime().as((t) => t.format("%a · %b %d · %H:%M")!)} />
    </box>
    <Calendar />
  </menubutton>
);
