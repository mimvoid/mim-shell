import app from "ags/gtk4/app";
import { For, createBinding } from "ags";
import { Astal, Gtk } from "ags/gtk4";

import Workspaces from "./workspaces";
import Title from "./windowTitle";

import Clock from "./clock";
import { Media, Dashboard, Session } from "./togglers";

import Tray from "./sysTray";
import ColorPicker from "./colorPicker";
import Network from "./network";
import Bluetooth from "./bluetooth";
import Sound from "./sound";
import Battery from "./battery";
import Brightness from "./brightness";

import { setLayerrules } from "@lib/utils";

export default () => {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
  const monitors = createBinding(app, "monitors");

  // Define the three parts of the bar
  const Left = (
    <box
      $type="start"
      class="left box"
      spacing={10}
      halign={Gtk.Align.START}
      hexpand
    >
      <Dashboard />
      <Workspaces />
      <Title />
    </box>
  );

  const Center = (
    <box $type="center" class="center box">
      <Clock />
      <Media />
    </box>
  );

  const Right = (
    <box $type="end" class="right box" halign={Gtk.Align.END} hexpand>
      <Tray />
      <ColorPicker />
      <Network />
      <Bluetooth />
      <Sound />
      <Battery />
      <Brightness />
      <Session />
    </box>
  );

  const CenterBox = (
    <centerbox>
      {Left}
      {Center}
      {Right}
    </centerbox>
  );

  return (
    <For each={monitors} cleanup={(win) => (win as Gtk.Window).destroy()}>
      {(monitor) => (
        <window
          $={(self) =>
            setLayerrules(self.namespace, [
              "blur",
              "blurpopups",
              "ignorezero",
              "xray 0",
            ])
          }
          name="bar"
          namespace="bar"
          class="bar"
          gdkmonitor={monitor}
          exclusivity={Astal.Exclusivity.EXCLUSIVE}
          anchor={TOP | LEFT | RIGHT}
          marginTop={3}
          marginRight={12}
          marginBottom={1}
          marginLeft={12}
          visible
          application={app}
        >
          {CenterBox}
        </window>
      )}
    </For>
  );
};
