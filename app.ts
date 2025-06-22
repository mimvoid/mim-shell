#!/usr/bin/env gjs -m

import { App } from "astal/gtk4";
import style from "./style/style.scss"; // root stylesheet
import { Bar, Notifications, SessionMenu } from "./widgets"; // windows

App.start({
  css: style,
  iconTheme: "Adwaita",

  requestHandler(request, res) {
    print(request);
    res("ok");
  },

  main() {
    // Map to every monitor
    for (const monitor of App.get_monitors()) {
      Bar(monitor);
      Notifications(monitor);
    }

    SessionMenu();
  },
});
