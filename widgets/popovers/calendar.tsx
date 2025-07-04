import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import GLib from "gi://GLib?version=2.0";

import PopRevealer from "@lib/widgets/PopRevealer";
import { pollTime, pollUptime } from "@lib/variables";
import { pointer, popButton } from "@lib/utils";
import Icon from "@lib/icons";

const { START, CENTER, END } = Gtk.Align;
const { VERTICAL } = Gtk.Orientation;

function fmt(format: string) {
  return (dt: GLib.DateTime) => dt.format(format) || "";
}

function Time() {
  const time = pollTime();
  const uptime = pollUptime();

  let Minute: Gtk.Label;
  const MajorTime = (
    <overlay $={(self) => self.set_measure_overlay(Minute, true)}>
      <label
        class="display hour"
        label={time(fmt("%H"))}
        halign={START}
        valign={START}
      />
      <label
        $={(self) => (Minute = self)}
        $type="overlay"
        class="display minute"
        label={time(fmt("%M"))}
        halign={END}
        valign={END}
      />
    </overlay>
  );

  const Uptime = (
    <label
      label={uptime((t) => `Up: ${Math.trunc(t / 60)}h ${Math.trunc(t % 60)}m`)}
      class="uptime"
      halign={START}
    />
  );

  return (
    <box class="big-clock" halign={CENTER} hexpand>
      {MajorTime}
      <box class="minor-time" valign={END} orientation={VERTICAL}>
        <label
          class="display second"
          label={time(fmt("%S"))}
          halign={START}
          valign={END}
        />
        {Uptime}
      </box>
    </box>
  );
}

function CalendarWidget() {
  function setupButton(self: Gtk.Button) {
    pointer(self);
    popButton(self);
  }

  const Cal = new Gtk.Calendar({
    showHeading: false,
    showDayNames: true,
    showWeekNumbers: true,
  });

  const month = createBinding(Cal, "month").as(
    () => Cal.get_date().format("%B") || "",
  );
  const year = createBinding(Cal, "year").as((y) => String(y));

  const Header = (
    <box class="header">
      <box class="month-switcher" hexpand>
        <button
          $={setupButton}
          iconName={Icon.nav.previous}
          onClicked={() => {
            if (--Cal.month < 0) {
              Cal.year--;
              Cal.month = 11;
            }
          }}
        />
        <button
          $={setupButton}
          iconName={Icon.nav.next}
          onClicked={() => {
            if (++Cal.month > 11) {
              Cal.year++;
              Cal.month = 0;
            }
          }}
        />
        <label label={month} />
      </box>
      <box class="year-switcher">
        <label label={year} />
        <button
          $={setupButton}
          iconName={Icon.nav.previous}
          onClicked={() => Cal.year--}
        />
        <button
          $={setupButton}
          iconName={Icon.nav.next}
          onClicked={() => Cal.year++}
        />
      </box>
    </box>
  );

  return (
    <box class="calendar-wrapper" orientation={VERTICAL}>
      {Header}
      {Cal}
    </box>
  );
}

export default () => (
  <PopRevealer name="calendar" hasArrow={false}>
    <box class="calendar" halign={CENTER} orientation={VERTICAL}>
      <Time />
      <CalendarWidget />
    </box>
  </PopRevealer>
) as Gtk.Popover;
