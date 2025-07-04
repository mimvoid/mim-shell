import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import Wp from "gi://AstalWp";

import HoverRevealer from "@lib/widgets/HoverRevealer";
import AudioPopover from "../popovers/audio";
import { pointer, stepOnScroll, toPercentage } from "@lib/utils";

const speaker = Wp.get_default()?.audio.defaultSpeaker!;

// Can mute or unmute speaker
const Icon = () => (
  <button
    $={pointer}
    onClicked={() => (speaker.mute = !speaker.mute)}
    iconName={createBinding(speaker, "volumeIcon")}
  />
);

// Only show slider on hover
function SliderHover() {
  // Control volume with slider
  const Slide = (
    <slider
      $={pointer}
      value={createBinding(speaker, "volume")}
      valign={Gtk.Align.CENTER}
      hexpand
    >
      <Gtk.EventControllerScroll onScroll={stepOnScroll} />
    </slider>
  );

  // Hitbox does not include the icon
  // (which makes clicking on the icon button easier)
  return (
    <menubutton>
      <HoverRevealer hiddenChild={Slide}>
        <label label={createBinding(speaker, "volume").as(toPercentage)} />
      </HoverRevealer>
      <AudioPopover />
    </menubutton>
  );
}

export default () => (
  <box class="sound icon-label">
    <Icon />
    <SliderHover />
  </box>
);
