#!/usr/bin/env gjs -m

import app from "ags/gtk4/app";
import style from "./style/style.scss"; // root stylesheet
import { Bar, Notifications, SessionMenu, Wallpapers } from "./widgets"; // windows

app.start({
  css: style,
  iconTheme: "Adwaita",

  main() {
    Bar();
    Notifications();
    SessionMenu();
    Wallpapers();
  },
});
