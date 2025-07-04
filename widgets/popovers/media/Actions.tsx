import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import Mpris from "gi://AstalMpris";

import Icons from "@lib/icons";
import { pointer, popButton } from "@lib/utils";

// Action buttons for playback

const { START, CENTER, END } = Gtk.Align;

export default (player: Mpris.Player) => {
  function setupButton(self: Gtk.Button) {
    pointer(self);
    popButton(self);
  }

  // Play or pause
  // Icon changes based on the playing status
  function Toggle() {
    const icon = createBinding(player, "playbackStatus").as(
      (s) =>
        Icons.mpris[s === Mpris.PlaybackStatus.PLAYING ? "pause" : "start"],
    );

    return (
      <button
        $={setupButton}
        class="play-pause"
        visible={createBinding(player, "canPlay")}
        iconName={icon}
        onClicked={() => player.play_pause()}
      />
    );
  }

  const Prev = (
    <button
      $={setupButton}
      class="previous"
      visible={createBinding(player, "canGoPrevious")}
      iconName={Icons.mpris.backward}
      onClicked={() => player.previous()}
    />
  );

  const Next = (
    <button
      $={setupButton}
      class="next"
      visible={createBinding(player, "canGoNext")}
      iconName={Icons.mpris.forward}
      onClicked={() => player.next()}
    />
  );

  function Loop() {
    const { UNSUPPORTED, NONE, TRACK } = Mpris.Loop;
    const loop = createBinding(player, "loopStatus");

    function updateLoop(self: Gtk.Button) {
      const loopStatus = loop.get();
      self.visible = loopStatus !== UNSUPPORTED;
      if (!self.visible) return;

      self.iconName = Icons.mpris[loopStatus === TRACK ? "loopSong" : "loop"];
      loopStatus == NONE
        ? self.add_css_class("off")
        : self.remove_css_class("off");
    }

    return (
      <button
        $={(self) => {
          setupButton(self);
          updateLoop(self);
          loop.subscribe(() => updateLoop(self));
        }}
        $type="start"
        class="loop"
        halign={START}
        onClicked={() => player.loop()}
      />
    );
  }

  function Shuffle() {
    const { UNSUPPORTED, ON } = Mpris.Shuffle;
    const shuffle = createBinding(player, "shuffleStatus");

    function updateShuffle(self: Gtk.Button) {
      const shuffleStatus = shuffle.get();
      self.visible = shuffleStatus !== UNSUPPORTED;
      if (!self.visible) return;

      if (shuffleStatus === ON) {
        self.remove_css_class("off");
        self.iconName = Icons.mpris.shuffle;
      } else {
        self.add_css_class("off");
        self.iconName = Icons.mpris.noShuffle;
      }
    }

    return (
      <button
        $={(self) => {
          setupButton(self);
          updateShuffle(self);
          shuffle.subscribe(() => updateShuffle(self));
        }}
        $type="end"
        class="shuffle"
        halign={END}
        onClicked={() => player.shuffle()}
      />
    );
  }

  return (
    <centerbox class="media-actions">
      <Loop />
      <box $type="center" class="main-actions" halign={CENTER} hexpand>
        {Prev}
        <Toggle />
        {Next}
      </box>
      <Shuffle />
    </centerbox>
  );
};
