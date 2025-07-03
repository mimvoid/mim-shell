import { bind } from "astal";
import { Gtk, hook } from "astal/gtk4";
import Wp from "gi://AstalWp";
import { pointer, popButton, drawValuePercentage } from "@lib/utils";
import PopRevealer from "@lib/widgets/PopRevealer";

const { START, CENTER, FILL } = Gtk.Align;

const wp = Wp.get_default()!;
const speaker = wp.audio.defaultSpeaker;
const microphone = wp.audio.defaultMicrophone;

function Section(endpoint: Wp.Endpoint, name: string) {
  const lowerName = name.toLowerCase();

  function muteHook(button: Gtk.Button) {
    if (endpoint.mute) {
      button.tooltipText = `Unmute ${lowerName}`;
      button.add_css_class("off");
    } else {
      button.tooltipText = `Mute ${lowerName}`;
      button.remove_css_class("off");
    }
  }
  const Icon = (
    // Can mute or unmute
    <button
      setup={(self) => {
        pointer(self);
        popButton(self);

        muteHook(self);
        hook(self, endpoint, "notify::mute", muteHook);
      }}
      cssClasses={["big-toggle"]}
      onClicked={() => (endpoint.mute = !endpoint.mute)}
    >
      <image
        iconName={bind(endpoint, "volumeIcon")}
        iconSize={Gtk.IconSize.LARGE}
      />
    </button>
  );

  const Label = (
    <label
      cssClasses={["description"]}
      label={bind(endpoint, "description").as((d) => d || endpoint.name || "")}
      halign={START}
      hexpand
    />
  );

  const Slider = (
    <slider
      setup={(self) => {
        pointer(self);
        drawValuePercentage(self);
      }}
      value={bind(endpoint, "volume")}
      onChangeValue={({ value }) => (endpoint.volume = value)}
      valign={CENTER}
      hexpand
    />
  );

  return (
    <box
      cssClasses={["section", lowerName]}
      halign={FILL}
      valign={CENTER}
      hexpand
      vexpand
      vertical
    >
      <label cssClasses={["title"]} label={name} halign={START} />
      <box>
        {Icon}
        <box vertical valign={CENTER} hexpand vexpand>
          {Label}
          {Slider}
        </box>
      </box>
    </box>
  );
}

const Speaker = Section(speaker, "Speaker");
const Microphone = Section(microphone, "Microphone");

export default (
  <PopRevealer cssClasses={["audio-popover"]} hasArrow={false}>
    <box vertical>
      {Speaker}
      {Microphone}
    </box>
  </PopRevealer>
);
