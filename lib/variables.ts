import { createPoll } from "ags/time";
import GLib from "gi://GLib";

export function pollTime() {
  return createPoll(GLib.DateTime.new_now_local(), 1000, () =>
    GLib.DateTime.new_now_local(),
  );
}

export function pollUptime() {
  return createPoll(
    0,
    60_00,
    "cat /proc/uptime",
    (line) => parseInt(line.split(".", 1)[0]) / 60,
  );
}

export const distro = {
  name: GLib.get_os_info("NAME"),
  logo: GLib.get_os_info("LOGO"),
  version: GLib.get_os_info("VERSION_ID"),
};

export const name = {
  username: GLib.get_user_name(),
  hostname: GLib.get_host_name(),
};
