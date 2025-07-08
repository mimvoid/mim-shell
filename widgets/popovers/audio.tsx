import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import Wp from "gi://AstalWp";

import { pointer, popButton, drawValuePercentage } from "@lib/utils";
import PopRevealer from "@lib/widgets/PopRevealer";

const { START, CENTER, FILL } = Gtk.Align;
const { VERTICAL } = Gtk.Orientation;

const wp = Wp.get_default()!;
const speaker = wp.audio.defaultSpeaker;
const microphone = wp.audio.defaultMicrophone;

function Section(endpoint: Wp.Endpoint, name: string) {
  const lowerName = name.toLowerCase();
  const mute = createBinding(endpoint, "mute");

  const Icon = (
    // Can mute or unmute
    <togglebutton
      $={(self) => {
        pointer(self);
        popButton(self);
      }}
      class="big-toggle"
      active={mute((m) => !m)}
      tooltipText={mute((m) => (m ? "Unmute " : "Mute ") + lowerName)}
      onClicked={() => (endpoint.mute = !endpoint.mute)}
    >
      <image
        iconName={createBinding(endpoint, "volumeIcon")}
        iconSize={Gtk.IconSize.LARGE}
      />
    </togglebutton>
  );

  const Label = (
    <label
      class="description"
      label={createBinding(endpoint, "description").as(
        (d) => d || endpoint.name || "",
      )}
      halign={START}
      hexpand
    />
  );

  const Slide = (
    <slider
      $={(self) => {
        pointer(self);
        drawValuePercentage(self);
      }}
      value={createBinding(endpoint, "volume")}
      onChangeValue={({ value }) => void (endpoint.volume = value)}
      valign={CENTER}
      hexpand
    />
  );

  return (
    <box
      cssClasses={["section", lowerName]}
      orientation={VERTICAL}
      halign={FILL}
      valign={CENTER}
      hexpand
      vexpand
    >
      <label class="title" label={name} halign={START} />
      <box>
        {Icon}
        <box orientation={VERTICAL} valign={CENTER} hexpand vexpand>
          {Label}
          {Slide}
        </box>
      </box>
    </box>
  );
}

export default () => (
  <PopRevealer class="audio-popover" hasArrow={false}>
    <box orientation={VERTICAL}>
      {Section(speaker, "Speaker")}
      {Section(microphone, "Microphone")}
    </box>
  </PopRevealer>
);
