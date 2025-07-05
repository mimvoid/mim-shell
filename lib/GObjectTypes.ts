import GObject, { ParamFlags } from "ags/gobject";
import { Gtk } from "ags/gtk4";
import GLib from "gi://GLib?version=2.0";

export const UInt = (name: string, flags: ParamFlags) =>
  GObject.ParamSpec.uint(name, null, null, flags, 0, GLib.MAXUINT32, 0);

export const Percent = (name: string, flags: ParamFlags) =>
  GObject.ParamSpec.double(name, null, null, flags, 0, 1, 0);

export const RevealerTransitionType = (name: string, flags: ParamFlags) =>
  GObject.ParamSpec.enum(
    name,
    null,
    null,
    flags,
    Gtk.RevealerTransitionType,
    Gtk.RevealerTransitionType.NONE,
  );
